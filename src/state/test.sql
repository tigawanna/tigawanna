-- Active: 1681734796825@@127.0.0.1@27017@green
-- db.collection("packages").aggregate([
--    {
--       $unwind: "$alldeps"
--    },
--    {
--       $project: {
--          alldeps: {
--             $cond: {
--                if: { $in: [ "$alldeps", [ "pkg1", "pkg2", "pkg3" ] ] },
--                then: { $concat: [ "aaaaaaa", "$alldeps" ] },
--                else: "$alldeps"
--             }
--          }
--       }
--    },
--    {
--       $sort: { alldeps: 1 }
--    },
--    {
--       $group: {
--          _id: "$_id",
--          alldeps: { $push: "$alldeps" }
--       }
--    },
--    {
--       $project: {
--          alldeps: {
--             $map: {
--                input: "$alldeps",
--                as: "dep",
--                in: { $substr: [ "$$dep", 7, { $strLenCP: "$$dep" } ] }
--             }
--          }
--       }
--    }
-- ])

db('green').collection('packages').aggregate(
   [
   {
      $unwind: "$alldeps"
   },
   {
      $sort: { "alldeps": 1 }
   },
      {
      $group: {
         _id: "$pkg_type",
         alldeps: { $push: "$alldeps" }
      }
      }
   ]
).toArray();
