import { cdn_jsdelivr_net } from '../registries/cdn.jsdelivr.net.ts'
import { den_ooo_alias } from '../registries/den.ooo/alias.ts'
import { den_ooo_gh } from '../registries/den.ooo/gh.ts'
import { den_ooo_gl } from '../registries/den.ooo/gl.ts'
import { deno_land } from '../registries/deno.land.ts'
import { denopkg_com } from '../registries/denopkg.com.ts'
import { esm_sh } from '../registries/esm.sh.ts'
import { jsr } from '../registries/jsr.ts'
import { npm } from '../registries/npm.ts'
import { raw_githubusercontent_com } from '../registries/raw.githubusercontent.com.ts'

export const registries = [
  cdn_jsdelivr_net,
  deno_land,
  esm_sh,
  npm,
  raw_githubusercontent_com,
  den_ooo_gh,
  den_ooo_gl,
  den_ooo_alias,
  jsr,
  denopkg_com,
]
