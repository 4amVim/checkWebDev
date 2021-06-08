const lists=['Chores','Work','Critical','Misc']

//*Takes in the [name] of the list you want to extract from fetched [rawData]
//*And does callback things with each of it's key-value pairs
function extractList ( name, rawData, callback ) {
    const list = rawData.fields[name].mapValue.fields;
    for ( const todo in list ) {
        console.log( list[todo].booleanValue );
        console.log( todo );
        callback( todo, list[todo].booleanValue,lists.indexOf(name)+1);
    }
}