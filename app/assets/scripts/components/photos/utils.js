import { saveAs } from 'file-saver';

/*
 * Download a photo
 */
export async function downloadPhoto ({ urls }) {
  saveAs(urls.full, urls.full.split('/').pop());
}
