export const cats = ['Semua karya', 'Naskah Pentas', 'Jurnal', 'Makalah', 'Puisi', 'Esai', 'Cerita Pendek'];
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const fileTypes = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', odt: 'application/vnd.oasis.opendocument.text', rtf: 'application/rtf', txt: 'text/plain', ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', epub: 'application/epub+zip' };
export const acceptedFiles = Object.keys(fileTypes).map((ext) => '.' + ext).join(',');
