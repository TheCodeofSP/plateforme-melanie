function calculateAge(dateOfBirth) {
  const birthDate =
    dateOfBirth instanceof Date
      ? dateOfBirth
      : new Date(`${dateOfBirth}T00:00:00.000Z`);

  const today = new Date();

  let age = today.getFullYear() - birthDate.getUTCFullYear();

  const birthdayHasPassed =
    today.getMonth() + 1 > birthDate.getUTCMonth() + 1 ||
    (today.getMonth() + 1 === birthDate.getUTCMonth() + 1 &&
      today.getDate() >= birthDate.getUTCDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

module.exports = {
  calculateAge,
};