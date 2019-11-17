
const r = require('rethinkdb')
exports.r = r;

var conn = null;

exports.connect = () => {
  return new Promise((resolve, reject) => {
    r.connect({db: 'airbus'})
      .then(res => {
        conn = res;
        console.log('connected to rethink db');
        resolve();
      })
      .catch(err => {
        console.error('Failed to connect to db', err);
        reject(err);
      });
  });
}

exports.live = (cursor, onUpdate) => {

  list = [];

  cursor.run(conn)
    .then(res => {
      res.each((err, row) => {
        if (err) {
          console.error(error);
          return;
        }

        list.push(row);
      });
    })
    .catch(err => {
      console.error(err);
    });

  cursor.changes().run(conn)
    .then(res => {
      res.each((err, row) => {

        if (err) {
          console.error(err);
          return;
        }

        if (!row.old_val) {
          list.push(row.new_val);

        } else {
          for(var i = 0; i < list.length; i++) {
            if (list[i].id == row.old_val.id) {
            
              if (!row.new_val) 
                list.splice(i, 1);
              else
                list[i] = row.new_val;
              break;
            }
          }
        }

        if(onUpdate) onUpdate(list);
      });
    })
    .catch(err => {
      console.error(err);
    });

  return list;
  
}