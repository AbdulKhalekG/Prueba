const passport = require('passport');
const { Strategy } = require('passport-local');
const { Pool } = require('pg');
const helpers =require('./helpers')

const config={
  connectionStreing: process.env.DATABASE_URL,
  max:500,
  min:100,
  ssl: {rejectUnauthorized:false}
  //user:'faefrtbvusiifx',
  //host:'ec2-54-152-28-9.compute-1.amazonaws.com',
  //password:'5183a7d5b0f78a919654a538803702f9df706a162dad8a790cf5a5cb9796490c',
  //database:'d54loslgcri427'
};
  
  const pool = new Pool(config); 
  
  const LocalStrategy = new Strategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  async (username, password, done) => {
    try {
      
      const user={
        username:username,
        clave:password
      }
      const result= await pool.query('SELECT* FROM usuarios WHERE username=$1',[user.username])
      if(result.rows.length>0){
         const newuser =result.rows[0];
       
         console.log(newuser.clave);
         const validpassword= await helpers.compararclave(password,newuser.clave) 
        
         if(validpassword){
          //password===newuser.clave
          done(null,newuser,console.log('welcome'))
          user.id=newuser.id_usuario
         
          passport.serializeUser((user,done)=>{
            done(null,user.id)
          })


         }else{
              done(null,false,console.log('password incorrect'))
              
         }
      }else{
        return done(null, false,console.log('user does not exist'))   
        
      }
      
    } catch (e) {
      console.log(e);
      return done(null, false);
    }
  }
);



passport.deserializeUser( async (id_usuario,done)=>{
    const rows = await pool.query('SELECT * FROM usuario WHERE id_usuario=?',[id_usuario])
    done(null,rows[0])
})

module.exports={
  LocalStrategy
}