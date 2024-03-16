import { assertEquals } from 'std/assert/mod.ts'
import { getNextVersion } from '../script/getNextVersion.ts'

Deno.test('getNextVersion()', () => {
  assertEquals(
    getNextVersion({
      importSpecifier: '',
      version: 'v1.2.0',
      versions: ['v1.0.0', '0.9.0', 'v3.0.0', 'v3.1.0', 'v4.1.0', '0.7.0'],
      allowBreaking: true,
      allowUnstable: false,
    }),
    'v4.1.0',
  )

  assertEquals(
    getNextVersion({
      importSpecifier: '',
      version: 'v1.2.0',
      versions: ['v1.0.0', '0.9.0', 'v3.0.0', 'v1.3.0', 'v1.4.0'],
      allowBreaking: false,
      allowUnstable: false,
    }),
    'v1.4.0',
  )

  assertEquals(
    getNextVersion({
      importSpecifier: '',
      version: 'v1.2.0',
      versions: ['v1.0.0', '0.9.0', 'v3.0.0', 'v4.0.0-beta.0', '0.2.0'],
      allowBreaking: true,
      allowUnstable: true,
    }),
    'v4.0.0-beta.0',
  )

  assertEquals(
    getNextVersion({
      importSpecifier: 'https://deno.land/x/foo@v1.2.0#~1.2',
      version: 'v1.0.0',
      versions: [
        'v1.0.0',
        '0.9.0',
        'v3.0.0',
        'v4.0.0-beta.0',
        '0.2.0',
        'v1.3.0',
        'v1.2.4',
        'v1.2.6',
        'v1.2.5',
        'v1.2.9',
      ],
      allowBreaking: true, // should have no effect
      allowUnstable: false,
    }),
    'v1.2.9',
  )
})
