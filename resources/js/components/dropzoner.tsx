import Dropzone from 'dropzone';
import 'dropzone/dist/dropzone.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

Dropzone.autoDiscover = false;

interface FileData {
  file_name: string;
  size: number;
  original_url: string;
}

interface DropzoneOptions {
  urlStore: string;
  csrf: string;
  acceptedFiles: string;
  files?: FileData[];
  maxFiles: number;
  kind: string;
  paramName: string;
}

const Dropzoner = (
  element: HTMLElement | null,
  key: string,
  { urlStore, csrf, acceptedFiles, files, maxFiles, kind }: DropzoneOptions
): Dropzone => {
  if (!element) throw new Error('Element not found');
  if (!urlStore) throw new Error('URL Store not found');
  if (!csrf) throw new Error('CSRF not found');
  if (!acceptedFiles) throw new Error('Accepted Files not found');
  if (!maxFiles) throw new Error('Max Files not found');
  if (!kind) throw new Error('Kind not found');

  console.log('Dropzoner initialized');

  const myDropzone = new Dropzone(element, {
    url: urlStore,
    headers: { 'X-CSRF-TOKEN': csrf },
    acceptedFiles: acceptedFiles,
    maxFiles: maxFiles,
    addRemoveLinks: true,
    init: function () {
      if (files) {
        files.forEach(file => {
          const mockFile = {
            name: file.file_name,
            size: file.size,
            accepted: true,
            kind,
            upload: {
              filename: file.file_name,
              size: file.size
            },
            dataURL: file.original_url
          } as unknown as Dropzone.DropzoneFile;

          this.emit('addedfile', mockFile);
          this.emit('thumbnail', mockFile, file.original_url);
          this.emit('complete', mockFile);

          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = `${key}[]`;
          input.value = file.file_name;
          mockFile.previewElement?.appendChild(input);
        });
      }
    },
    success: function (file: Dropzone.DropzoneFile) {
      const response = file.xhr ? JSON.parse(file.xhr.responseText) : {};
      if (response && file.upload) {
        const upload = file.upload as unknown as { filename: string; size: number };
        upload.filename = response.name;
        upload.size = response.size;
      }
      console.log('Upload successful');
    },
    error: function (file, message: string | Error) {
      const errorMessage = message instanceof Error ? message.message : message;
      Toastify({
        text: errorMessage,
        className: 'error',
        duration: 5000
      }).showToast();
      file.previewElement?.parentNode?.removeChild(file.previewElement);
    },
  });

  return myDropzone;
};

export default Dropzoner;
