import { initializeApp } from "firebase/app";
import { getStorage, ref, list } from "firebase/storage";
import { getFirestore, writeBatch, doc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';

const firebaseConfig = {
    apiKey: "AIzaSyAqUepCXM6TqaWZjVzzEgySmyAJaH8gQuA",
    authDomain: "com-melexis-test-ppui.firebaseapp.com",
    databaseURL: "https://com-melexis-test-ppui.firebaseio.com",
    projectId: "com-melexis-test-ppui",
    storageBucket: "com-melexis-test-ppui.appspot.com",
    messagingSenderId: "352983151186",
    appId: "1:352983151186:web:ad770d1bb82fd5196fe58b"
  };

const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // , 'gs://ppp-recipes-test');

const db = getFirestore();

async function allBlocks(path) {
    const listRef = ref(storage, path);
    let page = await list(listRef, { maxResults: 100 });
    console.log(`got response ${JSON.stringify(page)}`);
    let items = page.items;
    while (page.nextPageToken) {
        page = list(listRef, { maxResults: 100, pageToken: page.nextPageToken });
        items = items + page.items;
    }

    return items;
}

const Items = () => {
    const [blobs, setBlobs] = useState([]);
    console.log("blobs1: " + JSON.stringify(blobs));


    useEffect(() => {
        async function getBlobs() {
            const bs = await allBlocks("");
            setBlobs(bs);
        }

        getBlobs();
    });

    console.log("blobs2: " + JSON.stringify(blobs));

    return (
        <ul>
            { blobs.map(blob => <li key={blob.name}>{ blob.name }</li> )}
        </ul>
    );
};

const onClick = async (e) => {
    e.preventDefault();
    console.log(`onClick`);
    const batch = writeBatch(db);

    const recipes = ['abc', 'def'];
    const blockid = uuidv4();


    recipes.forEach(recipe => {
        batch.set(doc(db, `/blocks/${blockid}/recipes/${recipe}`), {});
        batch.set(doc(db, `/recipes/${recipe}/blocks/${blockid}`), {})
    })

    console.log(`writing batch ${JSON.stringify(batch)}`);
    
    await batch.commit();
};

export default function Blocks() {
    return (
        <div className={styles.container}>

            <div className={styles.grid}>
                <Items />
            </div>

            <button onClick={onClick}>Store recipe</button>
        </div>
    );
}