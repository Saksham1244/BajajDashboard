const { poolPromise, sql } = require('./db.js');

async function seedRealPartsMaterialStock() {
  console.log('Seeding official Bajaj Material tables using real Config_PartVariant parts...');
  const pool = await poolPromise;

  const realParts = [
    { partId: 'PD551086', min: 50, max: 400, store: 320, kitC: 45, kitD: 40, sideC: 25, sideD: 20 },
    { partId: 'PD551057', min: 60, max: 500, store: 280, kitC: 50, kitD: 45, sideC: 30, sideD: 25 },
    { partId: '52JE0545', min: 40, max: 350, store: 210, kitC: 35, kitD: 30, sideC: 20, sideD: 15 },
    { partId: '52JE0536', min: 40, max: 350, store: 220, kitC: 35, kitD: 30, sideC: 20, sideD: 15 },
    { partId: '52PD1803', min: 50, max: 450, store: 310, kitC: 40, kitD: 40, sideC: 25, sideD: 20 },
    { partId: 'DH103773', min: 70, max: 600, store: 45, kitC: 10, kitD: 10, sideC: 5, sideD: 5 }, // Critical shortage (< 70)
    { partId: '56PD5D28', min: 50, max: 400, store: 380, kitC: 50, kitD: 45, sideC: 30, sideD: 25 },
    { partId: '52PD1611', min: 50, max: 400, store: 410, kitC: 50, kitD: 50, sideC: 30, sideD: 30 }, // Excess (> 400)
    { partId: '14151033', min: 60, max: 500, store: 340, kitC: 45, kitD: 40, sideC: 25, sideD: 20 },
    { partId: '39188020', min: 60, max: 500, store: 290, kitC: 40, kitD: 40, sideC: 20, sideD: 20 },
    { partId: 'PD621421', min: 80, max: 600, store: 390, kitC: 60, kitD: 60, sideC: 35, sideD: 30 },
    { partId: 'PD621423', min: 80, max: 600, store: 380, kitC: 60, kitD: 60, sideC: 35, sideD: 30 }
  ];

  // 1. Seed Config_MaterialLocationMapping
  for (const p of realParts) {
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM Config_MaterialLocationMapping WHERE PartID = '${p.partId}')
      BEGIN
        INSERT INTO Config_MaterialLocationMapping (PartID, AreaID, StorageType, PackStdQty, MinAreaCapacity, MaxAreaCapacity)
        VALUES ('${p.partId}', 1, 1, 50, ${p.min}, ${p.max});
      END
      ELSE
      BEGIN
        UPDATE Config_MaterialLocationMapping
        SET MinAreaCapacity = ${p.min}, MaxAreaCapacity = ${p.max}, PackStdQty = 50
        WHERE PartID = '${p.partId}';
      END
    `);
  }
  console.log(`✓ Seeded ${realParts.length} records in Config_MaterialLocationMapping`);

  // 2. Seed Material_Stock
  for (const p of realParts) {
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM Material_Stock WHERE PartID = '${p.partId}')
      BEGIN
        INSERT INTO Material_Stock (
          PartID, IncomingQty, StoreQty, StoreHoldQty,
          LineCKitRackQty, LineCHoldKitRackQty, LineDKitRackQty, LineDHoldKitRackQty,
          LineCMaterialOnKit, LineCHoldMaterialOnKit, LineDMaterialOnKit, LineDHoldMaterialOnKit,
          LineCQty, LineCHoldQty, LineDQty, LineDHoldQty,
          LinesideCQty, LinesideCHoldQty, LinesideDQty, LinesideDHoldQty
        ) VALUES (
          '${p.partId}', 500, ${p.store}, 0,
          ${p.kitC}, 0, ${p.kitD}, 0,
          10, 0, 10, 0,
          15, 0, 15, 0,
          ${p.sideC}, 0, ${p.sideD}, 0
        );
      END
      ELSE
      BEGIN
        UPDATE Material_Stock SET
          StoreQty = ${p.store},
          StoreHoldQty = 0,
          LineCKitRackQty = ${p.kitC},
          LineDKitRackQty = ${p.kitD},
          LinesideCQty = ${p.sideC},
          LinesideDQty = ${p.sideD}
        WHERE PartID = '${p.partId}';
      END
    `);
  }
  console.log(`✓ Seeded ${realParts.length} records in Material_Stock`);

  // 3. Seed Material_Movement_Log
  await pool.request().query(`
    DELETE FROM Material_Movement_Log;
    INSERT INTO Material_Movement_Log (PartID, SourceAreaID, DestinationAreaID, Quantity, BatchID, TimeStamp) VALUES
      ('PD551086', 1, 2, 50, 101, DATEADD(minute, -180, GETDATE())),
      ('PD551057', 1, 2, 50, 102, DATEADD(minute, -150, GETDATE())),
      ('52JE0545', 1, 2, 40, 103, DATEADD(minute, -120, GETDATE())),
      ('52JE0536', 1, 2, 40, 104, DATEADD(minute, -90, GETDATE())),
      ('52PD1803', 1, 2, 50, 105, DATEADD(minute, -70, GETDATE())),
      ('DH103773', 1, 2, 20, 106, DATEADD(minute, -50, GETDATE())),
      ('56PD5D28', 1, 2, 40, 107, DATEADD(minute, -30, GETDATE())),
      ('52PD1611', 1, 2, 50, 108, DATEADD(minute, -15, GETDATE()));
  `);
  console.log('✓ Seeded 8 movement records in Material_Movement_Log');

  // 4. Seed Prod_Engine_Part_Geneology
  await pool.request().query(`
    DELETE FROM Prod_Engine_Part_Geneology;
    INSERT INTO Prod_Engine_Part_Geneology (VEIN, EngineNo, LineID, PlanID, SKUID, PartID, Qty, BatchID, Status)
    SELECT TOP 19 
      W.EngineNo as VEIN,
      W.EngineNo,
      W.LineID,
      W.PlanID,
      W.SKUID,
      P.partId as PartID,
      1 as Qty,
      'BAT-202611' as BatchID,
      1 as Status
    FROM Prod_Engine_WIP W
    CROSS JOIN (VALUES 
      ('PD551086'), ('PD551057'), ('52JE0545'), ('52JE0536'), ('52PD1803')
    ) AS P(partId);
  `);
  console.log('✓ Seeded consumption genealogy in Prod_Engine_Part_Geneology');

  console.log('\nSuccess! Real Bajaj parts seeded into official tables.');
  process.exit(0);
}

seedRealPartsMaterialStock().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
