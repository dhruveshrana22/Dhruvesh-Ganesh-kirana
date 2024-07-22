import firestore from "./firebase";

// Function to add a document to a collection
const addDocument = async (collectionName, data) => {
    try {
        await firestore().collection(collectionName).add(data);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};



// Function to get all documents from a collection
const getAllDocuments = async (collectionName) => {
    try {
        const snapshot = await firestore().collection(collectionName).get();
        const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return documents;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
};

// Function to update a document in a collection
const updateDocument = async (collectionName, docId, newData) => {
    try {
        await firestore().collection(collectionName).doc(docId).update(newData);
    } catch (error) {
        console.error("Error updating document: ", error);
    }
};

// Function to delete a document from a collection
const deleteDocument = async (collectionName, docId) => {
    try {
        await firestore().collection(collectionName).doc(docId).delete();
        console.log("Document deleted successfully!");
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
};

export { addDocument, getAllDocuments, updateDocument, deleteDocument };
