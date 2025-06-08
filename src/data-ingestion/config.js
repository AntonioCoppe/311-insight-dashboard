cat << 'EOF' > src/data-ingestion/config.js
// src/data-ingestion/config.js
module.exports = {
  DOWNLOAD_URL: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/2e54bc0e-4399-4076-b717-351df5918ae7/resource/f3db05ab-2588-4159-89f7-56c74d1d8201/download/sr2025.zip',
  LOCAL_ZIP: 'data/sr2025.zip',
  LOCAL_CSV_DIR: 'data/csv',
  CSV_FILENAME: 'sr2025.csv'
};
EOF
