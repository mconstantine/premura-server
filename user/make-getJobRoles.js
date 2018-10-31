module.exports = ({ getDb }) => async (req, res) => {
  return res.send(await (await getDb()).collection('users').distinct('jobRole', {}, {}))
}
