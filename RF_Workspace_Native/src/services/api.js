const API_URL = "https://script.google.com/macros/s/AKfycbytd9c_FzcqJ_65nqNI-xplYVRD3gstZcIL6PBk34P81XdSqXTNcRWsYt5bbeqjg66N/exec";

export const callApi = async (action, payload = {}) => {
  try {
    let response;
    
    // Use POST for actions that send large data (syncing, uploading)
    if (action === 'syncDeltas' || action === 'uploadImage' || action === 'uploadQCImage') {
      const requestBody = { action, ...payload };
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(requestBody),
      });
    } else {
      // Use GET for fetching data (validatePin, getAppData, etc.)
      const queryParams = new URLSearchParams({ action, ...payload }).toString();
      response = await fetch(`${API_URL}?${queryParams}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    return { success: false, message: error.message };
  }
};

export const apiValidatePin = async (pin) => {
  return callApi('validatePin', { pin });
};

export const apiGetAppData = async (pin) => {
  return callApi('getAppData', { pin });
};

export const apiGetArchivedData = async (pin) => {
  return callApi('getArchivedData', { pin });
};

export const apiSyncDeltas = async (payload, pin) => {
  return callApi('syncDeltas', { pin, ...payload });
};
