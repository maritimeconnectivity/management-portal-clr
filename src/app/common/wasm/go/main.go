/*
 * Copyright (c) 2025 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"software.sslmate.com/src/go-pkcs12"
	"syscall/js"
)

func createCsrWrapper() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		promiseHandler := js.FuncOf(func(this js.Value, args []js.Value) any {
			resolve := args[0]
			reject := args[1]
			errorConstructor := js.Global().Get("Error")

			go func() {
				privKey, err := ecdsa.GenerateKey(elliptic.P384(), rand.Reader)
				if err != nil {
					errorObject := errorConstructor.New("Failed to generate key")
					reject.Invoke(errorObject)
					return
				}

				pkcs8Key, err := x509.MarshalPKCS8PrivateKey(privKey)
				if err != nil {
					errorObject := errorConstructor.New(err.Error())
					reject.Invoke(errorObject)
					return
				}

				subject := pkix.Name{
					CommonName: "Name",
				}

				template := &x509.CertificateRequest{
					Subject:            subject,
					SignatureAlgorithm: x509.ECDSAWithSHA384,
				}

				csr, err := x509.CreateCertificateRequest(rand.Reader, template, privKey)
				if err != nil {
					errorObject := errorConstructor.New("Failed to create CSR: " + err.Error())
					reject.Invoke(errorObject)
					return
				}

				// PEM encode CSR
				block := &pem.Block{
					Type:  "CERTIFICATE REQUEST",
					Bytes: csr,
				}
				pemBytes := pem.EncodeToMemory(block)
				if pemBytes == nil {
					errorObject := errorConstructor.New("Failed to PEM encode certificate request")
					reject.Invoke(errorObject)
					return
				}
				pemCsr := string(pemBytes)

				// PEM encode private key
				block = &pem.Block{
					Type:  "PRIVATE KEY",
					Bytes: pkcs8Key,
				}
				pemBytes = pem.EncodeToMemory(block)
				if pemBytes == nil {
					errorObject := errorConstructor.New("Failed to PEM encode private key")
					reject.Invoke(errorObject)
					return
				}
				pemPrivKey := string(pemBytes)

				// Extract public key
				pubKey := privKey.Public()
				rawPubKey, err := x509.MarshalPKIXPublicKey(&pubKey)
				if err != nil {
					errorObject := errorConstructor.New(err.Error())
					reject.Invoke(errorObject)
					return
				}

				// PEM encode public key
				block = &pem.Block{
					Type:  "PUBLIC KEY",
					Bytes: rawPubKey,
				}
				pemBytes = pem.EncodeToMemory(block)
				if pemBytes == nil {
					errorObject := errorConstructor.New("Failed to PEM encode public key")
					reject.Invoke(errorObject)
					return
				}
				pemPubKey := string(pemBytes)

				// Copy the generated private key to a JS Uint8Array
				jsBytes := js.Global().Get("Uint8Array").New(len(pkcs8Key))
				js.CopyBytesToJS(jsBytes, pkcs8Key)

				ret := map[string]any{
					"privateKeyPem": pemPrivKey,
					"rawPrivateKey": jsBytes,
					"publicKeyPem":  pemPubKey,
					"csr":           pemCsr,
				}

				resolve.Invoke(js.ValueOf(ret))
			}()

			return nil
		})

		return js.Global().Get("Promise").New(promiseHandler)
	})
}

func createPKCS12KeystoreWrapper() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) != 2 {
			return "Invalid number of args"
		}
		certs := args[0].String()
		rawPrivateKey := args[1]

		promiseHandler := js.FuncOf(func(this js.Value, args []js.Value) any {
			resolve := args[0]
			reject := args[1]
			errorConstructor := js.Global().Get("Error")

			go func() {
				rawPrivateKeyBytes := make([]byte, rawPrivateKey.Get("length").Int())
				js.CopyBytesToGo(rawPrivateKeyBytes, rawPrivateKey)

				var cert *x509.Certificate
				var caCert *x509.Certificate

				// PEM decode the first certificate
				block, rest := pem.Decode([]byte(certs))
				if block == nil {
					errorObject := errorConstructor.New("Failed to PEM decode certificate")
					reject.Invoke(errorObject)
					return
				}
				cert, err := x509.ParseCertificate(block.Bytes)
				if err != nil {
					errorObject := errorConstructor.New("Failed to parse certificate: " + err.Error())
					reject.Invoke(errorObject)
					return
				}

				// If there are still more left to decode, we decode the rest as the intermediate CA certificate
				if len(rest) > 0 {
					block, _ = pem.Decode(rest)
					if block == nil {
						errorObject := errorConstructor.New("Failed to PEM decode CA certificate")
						reject.Invoke(errorObject)
						return
					}
					caCert, err = x509.ParseCertificate(block.Bytes)
					if err != nil {
						errorObject := errorConstructor.New("Failed to parse CA certificate: " + err.Error())
						reject.Invoke(errorObject)
						return
					}
				}

				privKey, err := x509.ParsePKCS8PrivateKey(rawPrivateKeyBytes)

				// Generate random 26 character password
				password := rand.Text()

				// Build the PKCS#12 keystore
				pfx, err := pkcs12.Modern.Encode(privKey, cert, []*x509.Certificate{caCert}, password)
				if err != nil {
					errorObject := errorConstructor.New("Failed to encode PKCS12 keystore")
					reject.Invoke(errorObject)
					return
				}

				// Copy the generated keystore to a JS Uint8Array
				jsBytes := js.Global().Get("Uint8Array").New(len(pfx))
				js.CopyBytesToJS(jsBytes, pfx)

				ret := map[string]any{
					"keystore": jsBytes,
					"password": password,
				}

				resolve.Invoke(js.ValueOf(ret))
			}()

			return nil
		})

		return js.Global().Get("Promise").New(promiseHandler)
	})
}

func main() {
	js.Global().Set("createCsr", createCsrWrapper())
	js.Global().Set("createPKCS12Keystore", createPKCS12KeystoreWrapper())
	<-make(chan bool)
}
