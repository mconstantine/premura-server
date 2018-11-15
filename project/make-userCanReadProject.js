module.exports = ({ ObjectID }) => (user, project) => {
  const currentUserId = new ObjectID(user._id)
  return project.people.find(person => person._id.equals(currentUserId))
}
