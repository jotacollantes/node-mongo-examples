const mongoose = require('mongoose');

const { Usuarios } = require('./modeloUser')
const { Publicaciones } = require('./modeloPublicaciones')
const { Categories } = require('./modelCategories')

const DB_URI = 'mongodb://localhost:27017/app_youtube_blog'

// mongoose.connect(DB_URI,
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useCreateIndex: true
//     }, (err) => {
//         if (err) {
//             console.log('********* ERROR DE CONEXIÓN *******');
//         } else {
//             console.log('********* CONEXIÓN CORRECTA *******');
//         }
//     });


const mongoConnect= {
    connect: async ()=>{
        try {
        mongoose.connect(DB_URI);
        console.log('Mongo connection okey');
    } catch (error) {
        console.log('Mongo connection error');
        throw error;
    }
    },
    disconnect: async()=>{
        await mongoose.disconnect();
}}





const crearCategoria = async ()=> {
    
    //await Categories.create( {name: 'Tech' });
    await Categories.insertMany([{name: 'Tech' },{name: 'Salud' }] );
       
} 

const crearUsuario = async() => {
    await Usuarios.create(
        {
            name: 'Luis (edition)',
            email: 'luis@demo.com',
            numberPhone: '12345678',
            tag: ['edition']
        }
    )
}

const createPublicacion = async() => {
    const listPost = [
        // {
        //     title: 'Relaciones publicas',
        //     description: 'Hola mundo bla bla',
        //     author: new mongoose.Types.ObjectId("65b7ff9f746eac711195fa57"),
        //     categories: ['Tech']
        // },
        // {
        //     title: 'Noticia IMPORT Covid (Tech)',
        //     description: 'Hola mundo bla bla',
        //     author: new mongoose.Types.ObjectId("65b7ff9f746eac711195fa57"),
        //     categories: ['Tech', 'Salud']
        // }
        {
            title: 'Mi Post',
            description: 'Hola mundo bla bla',
            author: new mongoose.Types.ObjectId("65b7ff9f746eac711195fa57"),
            categories: ['Tech']
        }
    ]

    await Publicaciones.insertMany(listPost)
}

// createPublicacion();

const buscarPorId = async () => {
    const user = await Usuarios.findById('6021150a1f183b248c8a8e3f')
    console.log('EL usuario es ====> ', user);
}

const buscarPorCoincidenciaUno = async () => {
    const post = await Publicaciones.findOne({
        title: 'Mi post!'
    })

    console.log('**** RESULTADO ****', post);
}

const buscarPorCoincidenciaTodos = async () => {
    const post = await Publicaciones.find({
        title: {
            $eq: 'Mi post!'
        }
    })

    console.log('**** RESULTADO ****', post);
}

const buscarOCrear = async () => {
    const post = await Publicaciones.findOneAndUpdate(
        {
            title: '50 cosas sobre mi'
        },
        {
            description: 'Hola aqui me genere automaticamente',
            author: mongoose.Types.ObjectId("6021150a1f183b248c8a8e3f")
        },
        {
            new: true,
            upsert: true
        })

    console.log('****** BUSCAR O CREAR **********', post);
}

const editarPublicacion = async () => {
    const resultado = await Publicaciones.updateMany(
        {
            title: {
                $ne: '50 cosas sobre mi'
            }
        },
        {
            title: 'EDITADO (HOLA cosas)',
            description: ' EDITADO Nueva descripcion'
        },
        (err) => {
            //  console.log('*** ERRROR ***', err);
        }
    )

    console.log('***** RESULTADO EDITADO *****', resultado);
}

const borrarPost = async () => {
    const resultado = await Publicaciones.deleteMany(
        {
            title: 'EDITADO (HOLA cosas)'
        }
    )

    console.log('********* RESULTADO *******', resultado);
}

const publicacionConUsuario = async () => {

    // 1 - Publicaciones ---> 
    const resultado = await Publicaciones.aggregate(
        [
            {
                $lookup:
                {
                    from: "usuarios", // 2
                    localField: "author", // 1 (Publicaciones)
                    foreignField: "_id", // 2
                    as: "usuarioAuthor"
                }
            },
            //!Convierte un array a objeto y muestra un documento por cada elemento del arra
            { $unwind: "$usuarioAuthor" },
            { $match: { title: "Mi Post" } }
        ]
    )

    console.log('*********** RESULTADOS ***********', resultado);

}

const listaCategoriesConPublicaciones = async () => {

    const resultado = await Categories.aggregate( // (1) Padre --- (Categories)
        [
            {
                $lookup:
                {
                    from: "publicaciones", // (2) Hijo --- (publicaciones)
                    let: {
                        aliasNombreCategoria: "$name"// (1) Nombre de la categoria "Tech" (string)
                    },
                    pipeline: [ // (2) publicaciones
                        {
                            $match: {
                                $expr: {
                                    //!busca un string en el array $categories. $$aliasNombreCategoria tiene Salud o Tech
                                    $in: ["$$aliasNombreCategoria","$categories"] 
                                }
                            }
                        }
                    ],
                    as: 'listDePublicaciones'
                }
            },
            { $unwind: "$listDePublicaciones" },
        ]
    )

    console.log('*********** RESULTADOS ***********', JSON.stringify(resultado,null,2));
}




(async ()=> {
   await main();
  })();
  
  
   async function main() {
    
    await mongoConnect.connect()
    //await crearCategoria()
    //await publicacionConUsuario();
    // borrarPost();
    //  editarPublicacion()
    //  buscarOCrear()
    //  buscarPorCoincidenciaTodos()
    // buscarPorId();
    //await crearUsuario()
    //await createPublicacion()
    await listaCategoriesConPublicaciones();  
    await mongoConnect.disconnect()
  }


