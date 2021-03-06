import { apiUrl } from '../../config';
import { saveAs } from 'file-saver';
import { confirmJosmExport } from '../common/confirmation-prompt';

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

/*
 * Download a trace from the API using a token.
 */
export async function downloadTrace (accessToken, traceId) {
  const geojsonUrl = `${apiUrl}/traces/${traceId}?token=${accessToken}`;
  saveAs(geojsonUrl, `${traceId}.geojson`);
}
