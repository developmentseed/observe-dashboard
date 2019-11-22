import { apiUrl } from '../../config';
import {
  confirmJosmExport
} from '../common/confirmation-prompt';

/*
 * Handle "ExportToJosm" events.
 */
export async function handleExportToJosm (e, traceId) {
  e.preventDefault();

  const { result } = await confirmJosmExport();

  // When delete is confirmed, open JOSM Remote Control link in a
  // separate window
  if (result) {
    const gpxUrl = `${apiUrl}/traces/${traceId}.gpx`;
    window.open(`http://127.0.0.1:8111/import?url=${gpxUrl}`, '_blank');
  }
}
