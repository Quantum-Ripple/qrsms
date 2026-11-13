// Run with: node --experimental-vm-modules tests/finance/how-to-pay.test.mjs
// Compile the real SFCs with the installed Vue compiler; mock only API and toast boundaries.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import test from 'node:test'
import * as Vue from 'vue'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'

const root = fileURLToPath(new URL('../../', import.meta.url))
const funds = 'src/portals/finance/components/funds/'
const page = 'src/portals/finance/views/Howtopay.vue'
const plain = (value) => JSON.parse(JSON.stringify(value))
const mode = (id, overrides = {}) => ({
  id, name: `Mode ${id}`, kind: 'paybill', business_number: '001234',
  is_active: true, reference_type: 'admission_number', reference_text: '',
  applies_to: [], steps: [], ...overrides,
})

async function harness(overrides = {}) {
  const mounted = []
  const messages = []
  const api = {
    getPaymentModes: async () => [],
    createPaymentMode: async (body) => ({ id: 3, ...body }),
    updatePaymentMode: async (id, body) => ({ id, ...body }),
    deletePaymentMode: async () => undefined,
    reorderPaymentModes: async () => undefined,
    ...overrides,
  }
  const context = vm.createContext({ console, window: { confirm: () => true } })
  const cache = new Map()
  function synthetic(key, values) {
    const module = new vm.SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value)
    }, { context })
    cache.set(key, module)
  }
  synthetic('vue', { ...Vue, onMounted: (callback) => mounted.push(callback) })
  synthetic('vue-toastification', {
    useToast: () => ({
      success: (message) => messages.push(message),
      error: (message) => messages.push(message),
    }),
  })
  synthetic(path.join(root, 'src/portals/finance/api/fee.js'), api)

  async function load(filename) {
    if (cache.has(filename)) return cache.get(filename)
    let source = await readFile(filename, 'utf8')
    if (filename.endsWith('.vue')) {
      const { descriptor, errors } = parse(source, { filename })
      assert.equal(errors.length, 0)
      const script = compileScript(descriptor, { id: filename, genDefaultAs: '_component' })
      const template = compileTemplate({
        source: descriptor.template.content, filename, id: filename,
        compilerOptions: { bindingMetadata: script.bindings },
      })
      assert.deepEqual(template.errors, [])
      source = `${script.content}\n${template.code}\n_component.render = render;\nexport default _component;`
    }
    const module = new vm.SourceTextModule(source, { context, identifier: filename })
    cache.set(filename, module)
    await module.link(async (specifier) => {
      if (cache.has(specifier)) return cache.get(specifier)
      let resolved = path.resolve(path.dirname(filename), specifier)
      if (!path.extname(resolved)) resolved += '.js'
      return load(resolved)
    })
    return module
  }

  async function component(relative) {
    const module = await load(path.join(root, relative))
    if (module.status !== 'evaluated') await module.evaluate()
    return module.namespace.default
  }
  async function setup(relative, props = {}) {
    const events = []
    const definition = await component(relative)
    const state = definition.setup(props, {
      expose() {}, emit: (...args) => events.push(args),
    })
    return { state, events }
  }
  return { setup, component, mounted, messages, context }
}

test('preview shows active modes in order, account details, references and fee items', async () => {
  const h = await harness()
  const html = await renderToString(Vue.h(await h.component(`${funds}PhonePreview.vue`), {
    modes: [
      mode(1, { name: 'Hidden paybill', is_active: false }),
      mode(2, { name: 'School bank', kind: 'bank', bank_name: 'KCB', account_name: 'Our school', account_number: '00042', reference_type: 'custom', reference_text: 'SCHOOL/ADM', applies_to: ['transport'], steps: ['Visit your bank', ''] }),
      mode(3, { name: 'School paybill' }),
      mode(4, { name: 'In-app payment', kind: 'app' }),
    ],
  }))
  assert.doesNotMatch(html, /Hidden paybill/)
  for (const text of ['KCB', 'Our school', '00042', 'SCHOOL/ADM', 'Transport', 'Visit your bank', '001234', 'Student admission number', 'M-Pesa prompt']) {
    assert.ok(html.includes(text), text)
  }
  assert.ok(html.indexOf('School bank') < html.indexOf('School paybill'))
})

test('preview renders hidden drafts and explains an empty published list', async () => {
  const h = await harness()
  const Preview = await h.component(`${funds}PhonePreview.vue`)
  const draft = await renderToString(Vue.h(Preview, { mode: mode(1, { name: 'Draft mode', is_active: false }) }))
  assert.match(draft, /Draft mode/)
  assert.match(draft, /hidden from parents/)
  const empty = await renderToString(Vue.h(Preview, { modes: [mode(1, { is_active: false })] }))
  assert.match(empty, /No payment instructions are available/)
})

test('new paybill validates and submits trimmed details without stale bank fields', async () => {
  let body
  const h = await harness({ createPaymentMode: async (payload) => { body = payload; return { id: 7, ...payload } } })
  const { state, events } = await h.setup(`${funds}ModeForm.vue`, { mode: null })
  await state.save()
  assert.equal(body, undefined)
  assert.match(state.errorSummary.value, /name.*business number/)
  Object.assign(state.form, { name: ' School paybill ', business_number: ' 00123 ', bank_name: 'Old bank', steps: [' Open M-Pesa ', ' ', ' Enter the number '] })
  await state.save()
  assert.equal(body.name, 'School paybill')
  assert.equal(body.business_number, '00123')
  assert.equal(body.bank_name, '')
  assert.deepEqual(plain(body.steps), ['Open M-Pesa', 'Enter the number'])
  assert.deepEqual(plain(body.applies_to), [])
  assert.equal(body.is_active, true)
  assert.equal(events[0][0], 'saved')
})

test('editing a hidden bank mode preserves visibility and leaves the original untouched', async () => {
  let request
  const h = await harness({ updatePaymentMode: async (...args) => { request = args; return { id: args[0], ...args[1] } } })
  const original = mode(9, { is_active: false, kind: 'bank', bank_name: ' KCB ', account_name: ' School ', account_number: ' 00042 ', applies_to: ['fees'], steps: ['Old step'] })
  const snapshot = structuredClone(original)
  const { state } = await h.setup(`${funds}ModeForm.vue`, { mode: original })
  state.form.applies_to.push('transport')
  state.form.steps[0] = 'New step'
  await state.save()
  assert.equal(request[0], 9)
  assert.equal(request[1].account_number, '00042')
  assert.equal(request[1].account_name, 'School')
  assert.equal(request[1].business_number, '')
  assert.equal('is_active' in request[1], false)
  assert.deepEqual(original, snapshot)
  assert.match(h.messages[0], /still hidden/)
})

test('switching to in-app clears custom references and obsolete payment details', async () => {
  let body
  const h = await harness({ updatePaymentMode: async (_id, payload) => { body = payload; return payload } })
  const { state } = await h.setup(`${funds}ModeForm.vue`, { mode: mode(1, { reference_type: 'custom', reference_text: 'Old reference', bank_name: 'Old bank' }) })
  state.form.kind = 'app'
  await state.save()
  assert.equal(body.reference_type, 'admission_number')
  for (const field of ['reference_text', 'business_number', 'bank_name', 'account_name', 'account_number']) assert.equal(body[field], '')
})

test('bank and custom reference validation prevents incomplete saves', async () => {
  const h = await harness()
  const { state, events } = await h.setup(`${funds}ModeForm.vue`, { mode: null })
  Object.assign(state.form, { name: 'Bank', kind: 'bank', reference_type: 'custom', reference_text: ' ' })
  await state.save()
  assert.match(state.errorSummary.value, /bank name/)
  assert.match(state.errorSummary.value, /account number/)
  assert.match(state.errorSummary.value, /custom payment reference/)
  assert.equal(events.length, 0)
})

test('save errors expose nested and non-field validation messages and allow retry', async () => {
  let fail = true
  const h = await harness({ createPaymentMode: async (body) => {
    if (fail) throw { response: { data: { non_field_errors: ['Duplicate mode.'], steps: { 0: ['Invalid step.'] }, account_name: ['Invalid account name.'] } } }
    return body
  } })
  const { state, events } = await h.setup(`${funds}ModeForm.vue`, { mode: null })
  Object.assign(state.form, { name: 'Cash', kind: 'other' })
  await state.save()
  assert.match(state.errorSummary.value, /Duplicate mode.*Invalid step.*Invalid account name/)
  assert.equal(state.saving.value, false)
  assert.equal(events.length, 0)
  fail = false
  await state.save()
  assert.equal(state.errorSummary.value, '')
  assert.equal(events.length, 1)
})

test('a pending save blocks duplicate submissions', async () => {
  let finish
  let calls = 0
  const h = await harness({ createPaymentMode: () => { calls++; return new Promise((resolve) => { finish = resolve }) } })
  const { state } = await h.setup(`${funds}ModeForm.vue`, { mode: null })
  Object.assign(state.form, { name: 'Cash', kind: 'other' })
  const first = state.save()
  await state.save()
  assert.equal(state.saving.value, true)
  assert.equal(calls, 1)
  finish({ id: 1 })
  await first
  assert.equal(state.saving.value, false)
})

test('load failures offer retry without pretending the school has no modes', async () => {
  let fail = true
  const h = await harness({ getPaymentModes: async () => { if (fail) throw new Error('offline'); return [mode(1)] } })
  const { state } = await h.setup(page)
  await h.mounted[0]()
  assert.match(state.loadError.value, /Could not load/)
  state.openForm()
  assert.equal(state.view.value, 'list')
  fail = false
  await state.load()
  assert.equal(state.loadError.value, '')
  assert.equal(state.modes.value.length, 1)
  state.openForm()
  assert.equal(state.view.value, 'form')
})

test('reorder rolls back on failure and prevents overlapping mutations', async () => {
  let reject
  let sent
  let updates = 0
  const h = await harness({
    getPaymentModes: async () => [mode(1), mode(2), mode(3)],
    reorderPaymentModes: (ids) => { sent = ids; return new Promise((_resolve, fail) => { reject = fail }) },
    updatePaymentMode: async () => { updates++ },
  })
  const { state } = await h.setup(page)
  await state.load()
  const moving = state.move({ mode: state.modes.value[0], dir: 1 })
  assert.deepEqual(plain(sent), [2, 1, 3])
  assert.equal(state.busy.value, true)
  await state.toggle(state.modes.value[0])
  assert.equal(updates, 0)
  reject(new Error('offline'))
  await moving
  assert.deepEqual(plain(state.modes.value.map((item) => item.id)), [1, 2, 3])
  assert.equal(state.busy.value, false)
})

test('reorder accepts an empty success response without losing the list', async () => {
  const h = await harness({ getPaymentModes: async () => [mode(1), mode(2)] })
  const { state } = await h.setup(page)
  await state.load()
  await state.move({ mode: state.modes.value[1], dir: -1 })
  assert.deepEqual(plain(state.modes.value.map((item) => item.id)), [2, 1])
})

test('visibility and deletion preserve state on failure and update it after success', async () => {
  let fail = true
  let deletes = 0
  const h = await harness({
    getPaymentModes: async () => [mode(1)],
    updatePaymentMode: async () => { if (fail) throw new Error('offline') },
    deletePaymentMode: async () => { deletes++; if (fail) throw new Error('offline') },
  })
  const { state } = await h.setup(page)
  await state.load()
  const item = state.modes.value[0]
  await state.toggle(item)
  assert.equal(item.is_active, true)
  h.context.window.confirm = () => false
  await state.remove(item)
  assert.equal(deletes, 0)
  h.context.window.confirm = () => true
  await state.remove(item)
  assert.equal(state.modes.value.length, 1)
  fail = false
  await state.toggle(item)
  assert.equal(item.is_active, false)
  await state.remove(item)
  assert.equal(state.modes.value.length, 0)
})

test('list disables every row action while a mutation is pending', async () => {
  const h = await harness()
  const html = await renderToString(Vue.h(await h.component(`${funds}ModeList.vue`), { modes: [mode(1), mode(2)], busy: true }))
  const buttons = html.match(/<button\b[^>]*>/g)
  assert.equal(buttons.length, 10)
  for (const button of buttons) assert.match(button, /\bdisabled\b/)
})
