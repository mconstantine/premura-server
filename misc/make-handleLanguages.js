module.exports = ({ fs, path, gt, mo, langs }) => {
  !this.didReadTranslations && langs.forEach(lang => {
    const filePath = path.resolve(__dirname, '../languages', `${lang}.mo`)

    if (!fs.existsSync(filePath)) {
      return
    }

    const translation = fs.readFileSync(filePath)
    const parsedTranslation = mo.parse(translation)

    gt.addTranslations(lang, 'premura', parsedTranslation)
    gt.setTextDomain('premura')
  })

  this.didReadTranslations = true

  return (req, res, next) => {
    if (req.session.user && req.session.user.lang) {
      gt.setLocale(req.session.user.lang)
    }

    return next()
  }
}
