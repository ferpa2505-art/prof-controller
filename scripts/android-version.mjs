// Calcula e confere o versionCode do Android SEM depender do Gradle nem de segredos.
// A fórmula é a MESMA de android/app/build.gradle (um teste confere que as duas não se afastaram):
//   versionCode = MAJOR*1000000 + MINOR*10000 + PATCH*100 + BUILD      (BUILD de 0 a 99)
//
// Uso:
//   node scripts/android-version.mjs                       # versionCode da versão do package.json, BUILD=0
//   node scripts/android-version.mjs --build 3             # BUILD explícito (ou BUILD_NUMBER no ambiente)
//   node scripts/android-version.mjs --ultimo 1030100      # recusa se o novo não for MAIOR que o último publicado
//
// "Último publicado" vem do Play Console (Versão → Produção → versionCode do bundle ativo), informado por um
// humano: este script não acessa a Play nem usa credenciais.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const MAX_VERSION_CODE = 2100000000; // limite da Google Play

export function calcularVersionCode(version, build = 0) {
  const m = /^(\d{1,4})\.(\d{1,2})\.(\d{1,2})$/.exec(String(version));
  if (!m) throw new Error(`version '${version}' precisa ser exatamente MAJOR.MINOR.PATCH (ex.: 1.2.0), sem sufixos`);
  const [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const textoBuild = String(build);
  if (!/^\d{1,2}$/.test(textoBuild)) throw new Error(`buildNumber '${textoBuild}' precisa ser um número de 0 a 99`);
  const b = Number(textoBuild);
  if (major > 2100 || minor > 99 || patch > 99 || b > 99) {
    throw new Error(`versionCode: MAJOR até 2100 e MINOR, PATCH, BUILD até 99 (${version} build ${b})`);
  }
  const code = major * 1000000 + minor * 10000 + patch * 100 + b;
  if (code < 1 || code > MAX_VERSION_CODE) throw new Error(`versionCode ${code} fora do intervalo aceito pela Google Play (1..${MAX_VERSION_CODE})`);
  return code;
}

/** A Play recusa versionCode igual ou menor que um já enviado. */
export function validarSequencia(novo, ultimoPublicado) {
  if (!Number.isInteger(novo) || novo < 1) throw new Error(`versionCode novo inválido: ${novo}`);
  if (ultimoPublicado === undefined || ultimoPublicado === null) return;
  if (!Number.isInteger(ultimoPublicado) || ultimoPublicado < 1) throw new Error(`último versionCode publicado inválido: ${ultimoPublicado}`);
  if (novo === ultimoPublicado) {
    throw new Error(`versionCode ${novo} repete o último publicado (${ultimoPublicado}): suba o version do package.json ou use outro build (BUILD 1 a 99)`);
  }
  if (novo < ultimoPublicado) {
    throw new Error(`versionCode ${novo} é MENOR que o último publicado (${ultimoPublicado}): a Play recusa; suba o version do package.json`);
  }
}

function lerArgs(argv) {
  const out = { build: process.env.BUILD_NUMBER || '0', ultimo: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--build') out.build = argv[++i] ?? '';
    else if (argv[i] === '--ultimo') out.ultimo = argv[++i] ?? '';
    else throw new Error(`argumento desconhecido: ${argv[i]}`);
  }
  if (out.ultimo !== undefined && !/^\d{1,10}$/.test(out.ultimo)) throw new Error(`--ultimo precisa ser um inteiro positivo (recebi '${out.ultimo}')`);
  return { build: out.build, ultimo: out.ultimo === undefined || out.ultimo === '' ? undefined : Number(out.ultimo) };
}

async function main() {
  const { build, ultimo } = lerArgs(process.argv.slice(2));
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const code = calcularVersionCode(pkg.version, build);
  validarSequencia(code, ultimo);
  console.log(`versionName ${pkg.version}, build ${build}, versionCode ${code}${ultimo ? ` (maior que o último publicado, ${ultimo})` : ' (último publicado NÃO informado: sequência não conferida)'}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(`erro: ${e.message}`); process.exitCode = 1; });
}
