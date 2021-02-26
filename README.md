# ImgDrive API

[Link to deployed Application](https://imgdrive.vercel.app/)

## Routes

### Folder routes

 - `/api/dir` => get root files and folders
 - `/api/dir/new` => create new folder
 - `/api/dir/new?parent={parent_id}` => create a new folder with given parent_id
 - `/api/dir/:id/rename` => rename a folder with given ID
 - `/api/dir/:id/children` => get all children of a folder with given ID.
 - `DELETE`, `/api/dir/:id` => delete a folder and all its children with given ID.
 - `/api/dir/:id/size` => returns size of a folder 

### File routes

- `/api/file/upload` => upload a file to the server
- `/api/file/search?q={query}&&format={format}` => search for a file with given name and an optional format parameter.

## Database schema

Database used is MongoDB

### File Schema

```javascript
{
    parent_id: {
        type: Schema.Types.ObjectId,
        default: null,
    },
    name: String,
    format: String,
    size: Number,
    width: Number,
    height: Number,
}
```

### Folder Schema

```javascript
{
    name: String,
    parent_id: {
        type: Schema.Types.ObjectId,
        default: null,
    },
    size: {
        type: Number,
        default: 0,
    },
}
```