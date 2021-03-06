const locale = require('locale');
const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

exports.supportedLocales = new locale.Locales(['en', 'en_US', 'ru', 'ru_RU', 'ua', 'uk_UA']);

exports._t = translationKey => (req, res) => {
  if (!res.req.locale) throw new Error('You forgot to provide lang!');
  if (!translationKey) throw new Error('You forgot to provide translation key!');
  const translations = {};
  fs
    .readdirSync(`${__dirname}/languages`)
    .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-5) === '.json'))
    .forEach((file) => {
      const fileData = fs.readFileSync(`${__dirname}/languages/${file}`);
      const fileName = path.basename(file, '.json');
      translations[fileName] = JSON.parse(fileData.toString('utf8'));
    });
  const lang = res.req.locale && res.req.locale.split('_')[0];
  return translations[lang][translationKey];
};
