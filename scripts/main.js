//*The types we have over at firebase
const lists = ['Chores', 'Work', 'Critical', 'Misc']
let globalData;

redraw();
[1, 2, 3, 4].forEach( ( i ) => { document.getElementById( `title${ i }` ).addEventListener( "click", click( i ) ) } );

//*Takes in the [name] of the list you want to extract from fetched [rawData]
//*And does callback things with each of it's key-value pairs

//*Fetch and draw lists
//! Needs optimization, retrieve from local cache on change
function redraw () {
    fetch(
        "https://firestore.googleapis.com/v1/projects/small-todo-14345/databases/(default)/documents/main/pika",
        { method: 'GET' }
    ).then( function ( response ) {
        if ( response.status == 200 ) {
            // The API call was successful!
            response.json().then( ( data ) => {
                globalData = data;
                function extractList ( name, data, callback ) {
                    const list = data.fields[name].mapValue.fields;
                    let currentList = document.getElementById( `list${ lists.indexOf( name ) + 1 }` )
                    while ( currentList.lastChild.nodeType != 3 ) {
                        currentList.removeChild( currentList.lastChild );
                    }
                    for ( const todo in list ) {
                        console.log( list[todo].booleanValue );
                        console.log( todo );
                        callback( todo, list[todo].booleanValue, lists.indexOf( name ) + 1 );
                    }
                }

                lists.forEach( ( _ ) => extractList( _, data, createCard ) );
            } );
        } else {
            apologise()

        }
    } )
        .catch( function ( err ) {
            // There was an error
            console.warn( "Something went wrong.", err );
            var errorHeading = document.createElement( 'h3' );
            errorHeading.textContent = err;
            document.body.appendChild( errorHeading );
        } );
}

function addTodo ( listName, idToAdd ) {
    fetch(
        generateUrl( listName, idToAdd ),
        {
            method: 'PATCH',
            body: JSON.stringify( generateBody( listName, idToAdd ) )
        }
    ).then( function ( response ) {
        if ( response.status == 200 ) {
            // The API call was successful!
            response.json().then( ( data ) => {
                console.log( `added new todo->${ data }` );
                redraw();
                let listToRefresh = getElementById( `list${ lists.indexOf( listName ) }` );
                let itsContent = listToRefresh.innerHTML;
                listToRefresh.innerHTML = itsContent;
            } );
        } else {
            apologise();
        }
    } )

}

function createCard ( key, value, id ) {
    //Get putative list
    var list = document.getElementById( `list${ id }` );

    //Create its state
    var todo = document.createElement( 'p' );
    todo.appendChild( document.createTextNode( key ) );
    if ( !value ) {
        todo.setAttribute( 'class', 'noIcon' )
    }

    //Draw it
    var newCard = document.createElement( 'div' )
    newCard.appendChild( todo );
    newCard.setAttribute( 'class', `card${ id }` );
    list.appendChild( newCard );
}

function markTodo ( listName, idToFlip ) {
    fetch( generateUrl( listName, idToFlip ),
        {
            method: 'PATCH',
            body: JSON.stringify( generateBody( listName, idToFlip ) )
        }
    ).then( function ( response ) {
        console.log( response.status );
        console.log( response );
        if ( response.status == 200 ) {
            // The API call was successful!
            response.json().then( ( data ) => {
                //Create its state
                var todo = document.createElement( 'p' );
                todo.appendChild( document.createTextNode( data ) );
                document.body.appendChild( todo );

            } );
        } else {
            apologise();

        }
    } )

}

function apologise () {
    var errorHeading = document.createElement( 'h3' );
    errorHeading.setAttribute( 'style', 'color:white; top:20%; position:absolute; text-align:center; width:100%' )
    errorHeading.textContent = "Apologies, but something isn't quite right";
    document.body.innerHTML = "";
    document.body.appendChild( errorHeading );
}

function generateBody ( listName, changing ) {
    return {
        "name": Date(),
        "fields": {
            [listName]: {
                "mapValue": {
                    "fields": {
                        [changing]: {
                            "booleanValue": false
                        }
                    }
                }
            }
        }
    }
}

function generateUrl ( listName, changing ) {
    //testing
    // return `https://firestore.googleapis.com/v1/projects/small-todo/databases/(default)/documents/trycol/trydoc?updateMask.fieldPaths=${ listName }.%60${ encodeURIComponent( changing ) }%60`;
    //master
    return `https://firestore.googleapis.com/v1/projects/small-todo-14345/databases/(default)/documents/main/pika?updateMask.fieldPaths=${ listName }.%60${ encodeURIComponent( changing ) }%60`;
}


function click ( i ) {
    return function () {
        console.log( `${ i } clicked me` );
        let newTodo = prompt( `What do you want to add to ${ lists[--i] }?` );
        if ( newTodo ) { addTodo( lists[i], newTodo ); }
    }
}
