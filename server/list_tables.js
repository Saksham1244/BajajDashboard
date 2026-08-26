const sql = require('mssql/msnodesqlv8');
const config = { database: 'PPMS_BajajPant', server: 'DESKTOP-QVV1OE5\\MSSQLSERVER01', driver: 'msnodesqlv8', options: { trustedConnection: true } };
sql.connect(config).then(pool => pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'")).then(res => {
  console.log(res.recordset.map(r=>r.TABLE_NAME).join(', '));
  process.exit(0);
}).catch(console.error);
