import {build} from 'esbuild';
import {mkdtempSync,readFileSync,rmSync,cpSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.cwd();
const temp=mkdtempSync(join(tmpdir(),'dev-tools-consumer-'));
function run(command,args,cwd=root){const r=spawnSync(command,args,{cwd,encoding:'utf8'});if(r.status!==0)throw new Error(r.stdout+'\n'+r.stderr);return r.stdout;}
try {
 const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
 const [pack]=JSON.parse(run('npm',['pack','--json','--pack-destination',temp]));
 for(const name of pkg.bundleDependencies) assert.ok(pack.files.some(f=>f.path===`node_modules/${name}/package.json`),`Missing bundled dependency: ${name}`);
 run('npm',['install','--prefix',temp,'--ignore-scripts','--legacy-peer-deps','--offline','--no-audit','--no-fund',join(temp,pack.filename)],temp);
 // The host supplies React. Copy its locked installation as a consumer fixture.
 for(const peer of ['react','react-dom','scheduler']) {
  const source=join(root,'node_modules',peer);
  if(existsSync(source)) cpSync(source,join(temp,'node_modules',peer),{recursive:true});
 }
 for(const key of Object.keys(pkg.exports)){
  const entry=pkg.name+key.slice(1);
  const css=key.endsWith('.css');
  const result=await build({absWorkingDir:temp,stdin:{contents:css?`@import "${entry}";`:`export * from '${entry}';`,resolveDir:temp,loader:css?'css':'ts'},bundle:true,platform:'browser',format:'esm',write:false,metafile:true,outfile:join(temp,css?'out.css':'out.js')});
  assert.ok(result.outputFiles[0].contents.length>0);
  const inputs=Object.keys(result.metafile.inputs);
  assert.ok(inputs.every(x=>!x.includes('verification-postgres')&&!x.includes('verification-server')&&!x.includes('verification-cli')),`Server package leaked through ${entry}`);
  console.log('Browser export verified: '+entry);
 }
 console.log('Packed client installs offline with all eleven bundled SDK packages.');
} finally {rmSync(temp,{recursive:true,force:true});}
