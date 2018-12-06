module.exports = ({ fs, path, gt, mo, langs }) => (req, res, next) => {
  langs.forEach(lang => {
    const filePath = path.resolve(__dirname, '../languages', `${lang}.mo`)

    if (!fs.existsSync(filePath)) {
      return
    }

    const translation = fs.readFileSync(filePath)
    const parsedTranslation = mo.parse(translation)

    gt.addTranslations(lang, 'premura', parsedTranslation)
    gt.setTextDomain('premura')
  })

  if (req.session.user && req.session.user.lang) {
    gt.setLocale(req.session.user.lang)
  }

  return next()
}
