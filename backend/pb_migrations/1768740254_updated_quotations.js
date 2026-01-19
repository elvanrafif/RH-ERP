/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1464122942")

  // remove field
  collection.fields.removeById("text618208161")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1464122942")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text618208161",
    "max": 0,
    "min": 0,
    "name": "zz",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
