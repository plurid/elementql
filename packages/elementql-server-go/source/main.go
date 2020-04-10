package main


import (
	"net/http"
	"encoding/json"
	"sync"
	"io/ioutil"
	"fmt"
	"time"
	"strings"
	// "os"
	// "math/rand"
)



type ElementQLServer struct {
    Schema string
	Resolvers string

    Port int
    ElementsPaths map[string]string
    Endpoint string
    AllowOrigin map[string]string
    AllowHeaders string
    Plugins map[string]string
    Verbose bool
    Open bool
    Playground bool
	PlaygroundEndpoint string
}


type RegisteredElementQLRoute struct {
	FileType string
    FilePath string
    Url string
}


type RegisteredElementQL struct {
	ID string
    Name string
    Routes map[string]RegisteredElementQLRoute
}


type ElementQLJSON struct {
	Name string `json:"name"`
	Properties string `json:"properties"`
}


type ElementQLJSONRequest struct {
	Elements map[string]ElementQLJSON `json:"elements"`
}


type elementqlHandlers struct {
	sync.Mutex
	store map[string]RegisteredElementQL
}


func (handlers *elementqlHandlers) handle(
	response http.ResponseWriter,
	request *http.Request,
) {
	switch request.Method {
	case "GET":
		handlers.get(response, request)
		return
	case "POST":
		handlers.post(response, request)
		return
	default:
		response.WriteHeader(http.StatusMethodNotAllowed)
		response.Write([]byte("Method Not Allowed."))
		return
	}
}


func (handlers *elementqlHandlers) get(
	response http.ResponseWriter,
	request *http.Request,
) {
	elementQL := []byte("ElementQL")

	response.Header().Add("Content-Type", "text/plain")
	response.WriteHeader(http.StatusOK)
	response.Write(elementQL)
}


func (handlers *elementqlHandlers) post(
	response http.ResponseWriter,
	request *http.Request,
) {
	bodyBytes, err := ioutil.ReadAll(request.Body)
	defer request.Body.Close()
	if err != nil {
		response.WriteHeader(http.StatusInternalServerError)
		response.Write([]byte(err.Error()))
		return
	}

	contentType := request.Header.Get("Content-Type")
	if contentType != "application/json" {
		response.WriteHeader(http.StatusUnsupportedMediaType)
		response.Write(
			[]byte(
				fmt.Sprintf(
					"Needs Content-Type: 'application/json', and got %s",
					contentType,
				),
			),
		)
		return
	}


	var element RegisteredElementQL
	err = json.Unmarshal(bodyBytes, &element)
	if err != nil {
		response.WriteHeader(http.StatusBadRequest)
		response.Write([]byte(err.Error()))
		return
	}

	element.ID = fmt.Sprintf("%d", time.Now().UnixNano())

	handlers.Lock()
	handlers.store[element.ID] = element

	defer handlers.Unlock()
}


func (handlers *elementqlHandlers) getElement(
	response http.ResponseWriter,
	request *http.Request,
) {
	parts := strings.Split(request.URL.String(), "/")

	if len(parts) != 3 {
		response.WriteHeader(http.StatusNotFound)
		return
	}

	id := parts[2]

	handlers.Lock()
	coaster, ok := handlers.store[id]
	handlers.Unlock()
	if !ok {
		response.WriteHeader(http.StatusNotFound)
		return
	}

	jsonBytes, err := json.Marshal(coaster)
	if err != nil {
		response.WriteHeader(http.StatusInternalServerError)
		response.Write([]byte(err.Error()))
		return
	}

	response.Header().Add("Content-Type", "application/json")
	response.WriteHeader(http.StatusOK)
	response.Write(jsonBytes)
}


func newElementqlHandlers() *elementqlHandlers {
	return &elementqlHandlers{
		store: map[string]RegisteredElementQL{},
	}
}



func main()  {
	elementqlHandlers := newElementqlHandlers()

	http.HandleFunc("/elementql", elementqlHandlers.handle)
	http.HandleFunc("/elementql/", elementqlHandlers.getElement)

	err := http.ListenAndServe(":33400", nil)
	if err != nil {
		panic(err)
	}
}
