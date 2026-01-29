package password

import "golang.org/x/crypto/bcrypt"

// Hash mật khẩu với bcrypt.
func Hash(plain string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	return string(bytes), err
}

// Compare so sánh mật khẩu thường và mật khẩu đã hash.
func Compare(hashed, plain string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain))
}
