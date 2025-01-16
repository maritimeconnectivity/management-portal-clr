export const encodeFileToBase64 = (file: File): Promise<{ file: File, content: string }> => {
    var fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        console.log('file', file);
        fileReader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target && typeof e.target.result === 'string') {
                const result = e.target.result;
                const base64Data = result.substring(result.indexOf('base64,') + 'base64,'.length);
                resolve({ file: file, content: base64Data });
            } else {
                reject(new Error('File reading failed'));
            }
        }
        fileReader.readAsDataURL(file)
     });
}