const { sql, poolPromise } = require('./db.js');

async function seed() {
    try {
        const pool = await poolPromise;
        
        const runQuery = async (query) => {
            return await pool.request().query(query);
        };

        console.log('Seeding Config Tables...');
        await runQuery(`
            IF NOT EXISTS (SELECT 1 FROM Config_Line WHERE LineID = 1)
            BEGIN
                SET IDENTITY_INSERT Config_Line ON;
                INSERT INTO Config_Line (LineID, ShopID, LineName, LineDesc) VALUES (1, 1, 'Line 1', 'Main Line');
                SET IDENTITY_INSERT Config_Line OFF;
            END
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT 1 FROM Config_SKU WHERE SKUID = 1)
            BEGIN
                SET IDENTITY_INSERT Config_SKU ON;
                INSERT INTO Config_SKU (SKUID, ModelID, SKUName, SKUDesc, SKUType) VALUES (1, 1, 'SKU-001', 'Default SKU', 1);
                SET IDENTITY_INSERT Config_SKU OFF;
            END
        `);
        
        console.log('Seeding Production & Performance Tables...');
        
        const records = 100;
        let startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        await runQuery(`DELETE FROM Prod_EnginePlanExecution WHERE PlanID >= 1000000;`);
        await runQuery(`DELETE FROM Prod_Shift_Plan WHERE PlanID >= 1000000;`);
        await runQuery(`DELETE FROM Perf_Hourly_OLE;`);
        await runQuery(`DELETE FROM Prod_Defect_Log;`);
        await runQuery(`DELETE FROM Prod_Engine_WIP WHERE EngineNo LIKE 'ENG-%';`);

        for (let i = 0; i < records; i++) {
            const current = new Date(startDate.getTime() + (i * 1.8 * 24 * 60 * 60 * 1000));
            const dateStr = current.toISOString().split('T')[0];
            const shift = i % 2 === 0 ? 'Shift A' : 'Shift B';
            const planId = 1000000 + i;
            const planQty = Math.floor(Math.random() * 50) + 50;
            const compQty = planQty - Math.floor(Math.random() * 5);
            const lineSpeed = Math.floor(Math.random() * 5) + 1;

            await runQuery(`
                SET IDENTITY_INSERT Prod_Shift_Plan ON;
                INSERT INTO Prod_Shift_Plan (PlanID, LineID, SKUID, ProdDate, ProdShift, PlanQty, Status, Priority, Source, LineSpeed)
                VALUES (${planId}, 1, 1, '${dateStr}', '${shift}', ${planQty}, 1, 1, 1, ${lineSpeed});
                SET IDENTITY_INSERT Prod_Shift_Plan OFF;
            `);

            // Prod_EnginePlanExecution (No Priority)
            await runQuery(`
                INSERT INTO Prod_EnginePlanExecution (
                    PlanID, LineID, SKUID, ProdDate, ProdShift, PlanQty,
                    KitAssembly_Qty, KitInspected_Qty, ENGMainLine_Qty, ENGNotOK_Qty, 
                    ENGNotOKBypass_Qty, ENGTakeOut_Qty, ENGReworkOK_Qty, ENGCompleted_Qty,
                    ENGMaterialHold_Qty, ENGQualityHold_Qty, ENGScrapped_Qty, Status, LineSpeed
                ) VALUES (
                    ${planId}, 1, 1, '${dateStr}', '${shift}', ${planQty},
                    ${planQty}, ${planQty}, ${compQty}, 2, 0, 1, 1, ${compQty}, 
                    0, 0, 1, 1, ${lineSpeed}
                )
            `);

            // Perf_Hourly_OLE (No LineID)
            const totalQty = planQty;
            const goodQty = compQty;
            const rejQty = totalQty - goodQty;
            const avail = (Math.random() * 10 + 85).toFixed(2);
            const perf = (Math.random() * 10 + 85).toFixed(2);
            const qual = (Math.random() * 5 + 90).toFixed(2);
            const ole = ((avail * perf * qual) / 10000).toFixed(2);

            await runQuery(`
                INSERT INTO Perf_Hourly_OLE (
                    SubAsslyLineID, ProdDate, ProdShift, TotalTime, TotalDownTime,
                    AvailableTime, PlannedQuantity, ExpectedQuantity, TotalQuantity,
                    GoodQuantity, RejectionQuantity, Availability, Performance, Quality, OLE
                ) VALUES (
                    1, '${dateStr}', '${shift}', GETDATE(), 30,
                    450, ${planQty}, ${planQty}, ${totalQty},
                    ${goodQty}, ${rejQty}, ${avail}, ${perf}, ${qual}, ${ole}
                )
            `);

            // Prod_Defect_Log (No LastUpdatedTime, Has DefectCheck, etc.)
            await runQuery(`
                INSERT INTO Prod_Defect_Log (
                    Timestamp, InspectionPointID, DefectID, EngineNo, DefectCheck, DefectAdjust, DefectAlert, DefectReplace, Remark, Status, UpdatedBy
                ) VALUES (
                    '${dateStr}', NULL, NULL, 'ENG-${planId}', 1, 0, 0, 0, 'Minor defect mock data', 1, 'Admin'
                )
            `);

            // Prod_Engine_WIP
            await runQuery(`
                INSERT INTO Prod_Engine_WIP (
                    EngineNo, PlanID, SKUID, LineID, 
                    StartTime, EndTime, Status, NotOkStation, ReEntryStation, SAMarrigeStatus
                ) VALUES (
                    'ENG-${planId}', ${planId}, 1, 1,
                    '${dateStr}', '${dateStr}', 1, NULL, NULL, 1
                )
            `);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
