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

import {Injectable} from '@angular/core';

import fileSaver from 'file-saver';
import JSZip from 'jszip';
import {CertificateBundle} from '../certificateBundle';
import {DocControllerService, DocDto, XmlControllerService, XmlDto} from 'src/app/backend-api/service-registry';
import {NotifierService} from 'gramli-angular-notifier';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class FileHelperService {
    constructor(private translate: TranslateService,
                private notifierService: NotifierService,
                private xmlControllerService: XmlControllerService,
                private docControllerService: DocControllerService,
    ) {

    }

    public downloadPemCertificate(certificateBundle: CertificateBundle, entityName: string) {
        try {
            const nameNoSpacesOrColons = entityName.replaceAll(/(\s|:)/, '_');

            const zip = new JSZip();
            zip.file("Certificate_" + nameNoSpacesOrColons + ".pem", certificateBundle.certificate!);
            if (certificateBundle.privateKey) {
                zip.file("PrivateKey_" + nameNoSpacesOrColons + ".pem", certificateBundle.privateKey);
            }
            if (certificateBundle.publicKey) {
                zip.file("PublicKey_" + nameNoSpacesOrColons + ".pem", certificateBundle.publicKey);
            }
            if (certificateBundle.pkcs12Keystore) {
                zip.file("Keystore_" + nameNoSpacesOrColons + ".p12", certificateBundle.pkcs12Keystore);
            }
            if (certificateBundle.keystorePassword) {
                zip.file("KeystorePassword_" + nameNoSpacesOrColons + ".txt", certificateBundle.keystorePassword);
            }
            zip.generateAsync({type: "blob"}).then(function (content) {
                fileSaver.saveAs(content, "Certificate_" + nameNoSpacesOrColons + ".zip");
            });
        } catch (error) {
            this.notifierService.notify('error', this.translate.instant('error.file.downloadcert') + error);
        }
    }

    public downloadXml(xmlFile: XmlDto): void {
        if (!xmlFile) {
            this.notifierService.notify('error', this.translate.instant('error.file.empty'));
            return;
        }
        const fileContent = xmlFile.content;

        const fileName = xmlFile.name;
        const fileType = xmlFile.contentContentType!;
        this.downloadFile(fileContent, fileType, fileName);
    }

    public downloadDoc(docFile: DocDto): void {
        if (!docFile) {
            this.notifierService.notify('error', this.translate.instant('error.file.empty'));
            return;
        }
        // TODO: I belive it is wrong that "content" is an array of strings. Please be wary of this may change in the future
        if (docFile.filecontent.length > 1 && docFile.filecontent.length < 10) {
            this.notifierService.notify('error', this.translate.instant('error.file.wrongformat') + docFile.name);
            return;
        }
        const fileContent = docFile.filecontent.toString();

        const fileName = docFile.name;
        const fileType = docFile.filecontentContentType!;
        this.downloadBase64File(fileContent, fileType, fileName);
    }

    public downloadBase64File(base64Content: string, fileType: string, fileName: string): void {
        try {
            const byteArray = this.convertBase64ToByteArray(base64Content);

            const blob = new Blob([byteArray], {type: fileType});
            fileSaver.saveAs(blob, fileName);
        } catch (error) {
            this.notifierService.notify('error', this.translate.instant('error.file.downloaderror') + error);
        }
    }

    public downloadFile(content: string, fileType: string, fileName: string): void {
        try {
            const blob = new Blob([content], {type: fileType});
            fileSaver.saveAs(blob, fileName);
        } catch (error) {
            this.notifierService.notify('error', this.translate.instant('error.file.downloaderror') + error);
        }
    }

    public deleteDoc(docId: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.docControllerService.deleteDoc(docId!).subscribe(
                () => {
                    this.notifierService.notify('success', this.translate.instant('success.file.delete'));
                    resolve(true);
                },
                (error) => {
                    this.notifierService.notify('error', this.translate.instant('error.file.delete') + error);
                    reject(false);
                }
            );
        });
    }

    public deleteXml(xmlFile: XmlDto): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.xmlControllerService.deleteXml(xmlFile.id!).subscribe(
                () => {
                    this.notifierService.notify('success', this.translate.instant('success.file.delete') + xmlFile.name);
                    resolve(true);
                },
                (error) => {
                    this.notifierService.notify('error', this.translate.instant('error.file.delete') + xmlFile.name + error);
                    reject(false);
                }
            );
        });
    }

    public uploadDoc = async (doc: DocDto): Promise<DocDto> => {
        return new Promise((resolve, reject) => this.docControllerService.createDoc(doc).subscribe(
            (res) => {
                this.notifierService.notify('success', this.translate.instant('success.file.upload') + doc.name);
                resolve(res);
            },
            (error) => {
                this.notifierService.notify('error', this.translate.instant('error.file.upload') + doc.name + error);
                reject(error);
            }
        ));
    }


    public uploadXml = async (xml: XmlDto): Promise<XmlDto> => {
        return new Promise((resolve, reject) => this.xmlControllerService.createXml(xml).subscribe(
            (res) => {
                this.notifierService.notify('success', this.translate.instant('success.file.upload') + xml.name);
                resolve(res);
            },
            (error) => {
                this.notifierService.notify('error', this.translate.instant('error.file.upload') + xml.name + error);
                reject(error);
            }
        ));
    }

    private convertBase64ToByteArray(base64Content: string): Uint8Array {
        const byteCharacters = window.atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Uint8Array(byteNumbers);
    }

}
