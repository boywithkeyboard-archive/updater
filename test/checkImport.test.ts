import * as semver from 'https://deno.land/std@0.190.0/semver/mod.ts#pin'
import { assertEquals } from 'std/assert/mod.ts'
import { checkImport, CheckResult } from '../script/checkImport.ts'

Deno.test('cdn.jsdelivr.net', async () => {
  const result1 = await checkImport(
    'https://cdn.jsdelivr.net/gh/jquery/jquery@3.6.4/dist/jquery.min.js',
  )

  assertEquals(result1 !== null, true)
  assertEquals(
    semver.gt(
      (result1 as CheckResult).newVersion,
      (result1 as CheckResult).oldVersion,
    ),
    true,
  )

  const result2 = await checkImport(
    'https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js',
  )

  assertEquals(result2 !== null, true)
  assertEquals(
    semver.gt(
      (result2 as CheckResult).newVersion,
      (result2 as CheckResult).oldVersion,
    ),
    true,
  )
})

Deno.test('den.ooo', async (t) => {
  await t.step('aliases', async () => {
    const result1 = await checkImport('https://den.ooo/proxy@v1.3.0/mod.ts#pin')

    assertEquals(result1 !== null, true)
    assertEquals(result1?.oldVersion === result1?.newVersion, true)

    const result2 = await checkImport('https://den.ooo/proxy@v1.3.0/mod.ts')

    assertEquals(result2 !== null, true)
    assertEquals(
      semver.gt(
        (result2 as CheckResult).newVersion,
        (result2 as CheckResult).oldVersion,
      ),
      true,
    )
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
  assertEquals(
    semver.gt(
      (result1 as CheckResult).newVersion,
      (result1 as CheckResult).oldVersion,
    ),
    true,
  )

  const result2 = await checkImport('https://deno.land/std@0.200.0/')

  assertEquals(result2 !== null, true)
  assertEquals(
    semver.gt(
      (result2 as CheckResult).newVersion,
      (result2 as CheckResult).oldVersion,
    ),
    true,
  )
})

Deno.test('esm.sh', async () => {
  const result = await checkImport('https://esm.sh/jquery@3.6.0')

  assertEquals(result !== null, true)
  assertEquals(
    semver.gt(
      (result as CheckResult).newVersion,
      (result as CheckResult).oldVersion,
    ),
    true,
  )
})

Deno.test('esm.sh directory with options', async () => {
  const result = await checkImport(
    'https://esm.sh/react-use@17.4.2&external=react,react-dom/esm/',
  )

  assertEquals(result !== null, true)
  assertEquals(
    semver.gt(
      (result as CheckResult).newVersion,
      (result as CheckResult).oldVersion,
    ),
    true,
  )
})

Deno.test('npm', async () => {
  const result1 = await checkImport('npm:esbuild@0.19.0')

  assertEquals(result1 !== null, true)
  assertEquals(result1?.oldVersion === result1?.newVersion, true)

  const result2 = await checkImport('npm:esbuild@^0.19.0')

  assertEquals(result2 !== null, true)
  assertEquals(
    semver.gt(
      (result2 as CheckResult).newVersion.replace(/[^0-9a-zA-Z\-.]+/g, ''),
      (result2 as CheckResult).oldVersion.replace(/[^0-9a-zA-Z\-.]+/g, ''),
    ),
    true,
  )
})

Deno.test('raw.githubusercontent.com', async () => {
  const result = await checkImport(
    'https://raw.githubusercontent.com/esbuild/deno-esbuild/v0.19.4/mod.js',
  )

  assertEquals(result !== null, true)
  assertEquals(
    semver.gt(
      (result as CheckResult).newVersion,
      (result as CheckResult).oldVersion,
    ),
    true,
  )
})

Deno.test('jsr', async () => {
  const result1 = await checkImport('jsr:@std/encoding@0.219.0')

  assertEquals(result1 !== null, true)
  assertEquals(result1?.oldVersion === result1?.newVersion, true)

  const result2 = await checkImport('jsr:@std/encoding@^0.218.0')

  assertEquals(result2 !== null, true)
  assertEquals(
    semver.gt(
      (result2 as CheckResult).newVersion.replace(/[^0-9a-zA-Z\-.]+/g, ''),
      (result2 as CheckResult).oldVersion.replace(/[^0-9a-zA-Z\-.]+/g, ''),
    ),
    true,
  )
})

Deno.test('denopkg.com', async () => {
  const result1 = await checkImport(
    'https://denopkg.com/boywithkeyboard/updater@v0.16.0/mod.ts',
  )

  assertEquals(result1 !== null, true)
  assertEquals(
    semver.gt(
      (result1 as CheckResult).newVersion,
      (result1 as CheckResult).oldVersion,
    ),
    true,
  )

  const result2 = await checkImport(
    'https://denopkg.com/boywithkeyboard/updater/mod.ts',
  )

  assertEquals(result2 === null, true)
})
