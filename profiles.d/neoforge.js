/* -------------------------------------------------------------------------- *
 *  NeoForge profile
 * -------------------------------------------------------------------------- */
const path     = require('path');
const fs       = require('fs-extra');
const https    = require('https');
const profile  = require('./template');

const REMOTE_XML = 'https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml';
const BASE       = 'https://maven.neoforged.net/releases/net/neoforged/neoforge/';

module.exports.profile = {
  name : 'NeoForge',
  id   : 'neoforge',
  type : 'release',
  group: 'neoforge',
  request_args : { url: REMOTE_XML, json: false },

  handler(profile_dir, xmlBody, cb) {
    let versions = extract(xmlBody);

    if (versions.length) return cb(null, build(versions, profile_dir));

    cb(null, build(versions, profile_dir));         // list may be empty
  }
};

/* ------------ helpers --------------------------------------------------- */
function extract(xml) {
  return (xml.match(/<version>([^<]+)<\/version>/g) || [])
          .map(v => v.slice(9, -10))
          .filter(v => !v.includes('SNAPSHOT'))
	  .filter(v => !v.includes('craftmine'));
}

function mcVersion(name) {
  const idSplit = name.split(/[.-]/);
  if (idSplit[1] == 0) {
    return `1.${idSplit[0]}`;
  }
  return `1.${idSplit[0]}.${idSplit[1]}`;
}

function build(list, dir) {
  return list.reverse().map(v => {
    const it = new profile();
    const mcversion    = mcVersion(v);

    it.id              = mcversion;
    it.group           = 'neoforge';
    it.webui_desc      = 'NeoForge ' + mcversion + ` (build ${v})`;
    it.type            = v.toLowerCase().includes('-beta') ? 'beta' : 'release';
    it.version         = it.release_version = v;
    it.filename        = `neoforge-${v}-installer.jar`;
    it.url             = BASE + v + '/' + it.filename;
    it.downloaded      = fs.existsSync(path.join(dir, v, it.filename));
    return it;
  });
}
