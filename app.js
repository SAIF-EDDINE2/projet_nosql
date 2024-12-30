const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const NodeCouchDb = require("node-couchdb");
const multer = require('multer');

// Configuration de l'application
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Configuration de Multer pour l'upload des fichiers en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Démarrage du serveur
app.listen(3000, () => {
    console.log("Server started on Port 3000");
});

// Connexion à CouchDB
const couch = new NodeCouchDb({
    auth: {
        user: "admin",
        pass: "admin",
    },
});

const dbName = "projet_nosql";
const viewUrl = "_design/projet_nosql/_view/getall";

// Lister toutes les bases de données
couch.listDatabases().then((dbs) => {
    console.log("Databases:", dbs);
});

// Route pour afficher tous les enregistrements
app.get("/", (req, res) => {
    couch.get(dbName, viewUrl).then(
        ({ data }) => {
            res.render("index", {
                projet_nosql: data.rows,
            });
        },
        (err) => {
            res.status(500).send(err);
        }
    );
});

// Route pour afficher le formulaire d'ajout d'un étudiant
app.get("/add-mahasiswa", (req, res) => {
    res.render("add-mahasiswa");
});

// Route pour ajouter un étudiant
app.post("/add-mahasiswa", upload.single('image'), (req, res) => {
    const { numero, nom, email, date_naissance, telephone, adresse, filiere, statut } = req.body;
    const image = req.file ? req.file.buffer.toString('base64') : null;  // Récupérer l'image en base64 si téléchargée

    couch.uniqid().then((ids) => {
        const id = ids[0];
        couch.insert(dbName, {
            _id: id,
            numero,
            nom,
            email,
            date_naissance,
            telephone,
            adresse,
            filiere,
            statut,
            image: image || undefined,  // Ajouter l'image en base64, ou undefined si aucune image
        }).then(
            () => {
                res.redirect("/");
            },
            (err) => {
                res.status(500).send(err);
            }
        );
    });
});

// Route pour afficher le formulaire de modification d'un étudiant
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;

    couch.get(dbName, id).then(
        ({ data }) => {
            res.render("edit-mahasiswa", {
                mahasiswa: data,
            });
        },
        (err) => {
            res.status(500).send(err);
        }
    );
});

// Route pour modifier un étudiant avec possibilité de mettre à jour l'image
app.post("/edit/:id", upload.single('image'), (req, res) => {
    const { _id, _rev, numero, nom, email, date_naissance, telephone, adresse, filiere, statut } = req.body;

    // Vérifier si une nouvelle image a été téléchargée
    let image;
    if (req.file) {
        // Si une image est téléchargée, la convertir en base64
        image = req.file.buffer.toString('base64');
    } else {
        // Sinon, garder l'image existante
        image = req.body.existing_image;
    }

    // Mise à jour du document dans CouchDB avec l'image (nouvelle ou ancienne)
    couch.update(dbName, {
        _id,
        _rev,
        numero,
        nom,
        email,
        date_naissance,
        telephone,
        adresse,
        filiere,
        statut,
        image: image || undefined,  // Utilisation de l'image existante ou nouvelle
    }).then(
        () => {
            res.redirect("/");
        },
        (err) => {
            res.status(500).send(err);
        }
    );
});



// Route pour supprimer un étudiant
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const rev = req.body.rev;

    if (!id || !rev) {
        return res.status(400).send("ID or revision is missing.");
    }

    couch.del(dbName, id, rev).then(
        () => {
            res.redirect("/");
        },
        (err) => {
            res.status(500).send(err);
        }
    );
});

// Route pour rechercher un étudiant
app.get("/search", (req, res) => {
    const query = req.query.query.toLowerCase();

    couch.get(dbName, viewUrl).then(
        ({ data }) => {
            const filteredResults = data.rows.filter((etudiant) =>
                etudiant.value.nom.toLowerCase().includes(query) ||
                etudiant.value.numero.toLowerCase().includes(query) ||
                etudiant.value.email.toLowerCase().includes(query)
            );

            res.render("index", {
                projet_nosql: filteredResults,
            });
        },
        (err) => {
            res.status(500).send(err);
        }
    );
});
