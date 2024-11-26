
# API Documentation
 

### Nudge Object Data Model

```json

{

"tagArticleOrEvent": "Some tagged article or event",

"title": "Title of the Nudge (60 char max)",

"image": "/path/to/nudge/image.jpg",

"scheduledOn": "dd/mm/yy",

"timings": {

"from": "hh:mm",

"to": "hh:mm"

},

"description": "Description of the nudge",

"icon": "/path/to/nudge/icon.png",

"invitation": "One line invitation"

}
```

### API Endpoints and Documentation

Base URL: https://api.example.com/id/...

  

1. Create Nudge

Endpoint: POST /nudges

Payload: Nudge Object Data Model

Description: This endpoint allows the user to create a new nudge.

  

2. Update Nudge

Endpoint: PUT /nudges/{id}

Payload: Partial Nudge Object Data Model

Description: This endpoint allows the user to update an existing nudge.

  

3. Get Nudge

Endpoint: GET /nudges/{id}

Response: Nudge Object Data Model

Description: This endpoint allows the user to retrieve the details of a specific nudge.

  

4. Delete Nudge

Endpoint: DELETE /nudges/{id}

Description: This endpoint allows the user to delete an existing nudge.

  

5. List Nudges

Endpoint: GET /nudges

Query Parameters:

- tagArticleOrEvent (optional)

- scheduleFrom (optional)

- scheduleTo (optional)

Response: Array of Nudge Object Data Model

Description: This endpoint allows the user to list all the nudges based on the provided filters.