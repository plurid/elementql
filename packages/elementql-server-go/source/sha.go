package sha

import (
    "crypto/sha1"
    "fmt"
)


func Sha(
	s: string
) {
    h := sha1.New()

    h.Write([]byte(s))

	bs := h.Sum(nil)

	return bs
}
