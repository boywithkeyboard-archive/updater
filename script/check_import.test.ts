import { assertEquals } from 'std/assert/mod.ts'
import { checkImport } from '../script/check_import.ts'

Deno.test('cdn.jsdelivr.net', async () => {
  const result1 = await checkImport(
    'https://cdn.jsdelivr.net/gh/jquery/jquery@3.6.4/dist/jquery.min.js',
  )

  assertEquals(result1 !== null, true)
  assertEquals(result1?.oldVersion !== result1?.newVersion, true)

  const result2 = await checkImport(
    'https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js',
  )

  assertEquals(result2 !== null, true)
  assertEquals(result2?.oldVersion !== result2?.newVersion, true)
})

Deno.test('den.ooo', async (t) => {
  await t.step('aliases', async () => {
    const result1 = await checkImport('https://den.ooo/proxy@v1.3.0/mod.ts#pin')

    assertEquals(result1 !== null, true)
    assertEquals(result1?.oldVersion === result1?.newVersion, true)

    const result2 = await checkImport('https://den.ooo/proxy@v1.3.0/mod.ts')

    assertEquals(result2 !== null, true)
    assertEquals(result2?.oldVersion !== result2?.newVersion, true)
  })

  await t.step('gh', async () => {
    const result = await checkImport(
      'https://den.ooo/gh/esbuild/deno-esbuild@v0.19.4/mod.js',
    )

    assertEquals(result !== null, true)
  })
})

Deno.test('deno.land', async () => {
  const result1 = await checkImport('https://deno.land/x/jose@v5.0.0/mod.ts')

  assertEquals(result1 !== null, true)
  assertEquals(result1?.oldVersion !== result1?.newVersion, true)

  const result2 = await checkImport('https://deno.land/std@0.200.0/')

  assertEquals(result2 !== null, true)
  assertEquals(result2?.oldVersion !== result2?.newVersion, true)
})

Deno.test('esm.sh', async () => {
  const result = await checkImport('https://esm.sh/jquery@3.6.0')

  assertEquals(result !== null, true)
  assertEquals(result?.oldVersion !== result?.newVersion, true)
})

Deno.test('esm.sh directory with options', async () => {
  const result = await checkImport('https://esm.sh/react-use@17.4.2&external=react,react-dom/esm/')

  assertEquals(result !== null, true)
  assertEquals(result?.oldVersion !== result?.newVersion, true)
})

Deno.test('npm', async () => {
  const result1 = await checkImport('npm:esbuild@0.19.0')

  assertEquals(result1 !== null, true)
  assertEquals(result1?.oldVersion === result1?.newVersion, true)

  const result2 = await checkImport('npm:esbuild@^0.19.0')

  assertEquals(result2 !== null, true)
  assertEquals(result2?.oldVersion !== result2?.newVersion, true)
})

Deno.test('raw.githubusercontent.com', async () => {
  const result = await checkImport(
    'https://raw.githubusercontent.com/esbuild/deno-esbuild/v0.19.4/mod.js',
  )

  assertEquals(result !== null, true)
  assertEquals(result?.oldVersion !== result?.newVersion, true)
})
