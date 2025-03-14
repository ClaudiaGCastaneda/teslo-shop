

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) return callback(new Error('File is empty'), false);
  
    const fileExtension = file.mimetype.split('/')[1]; // Extrae la extensión
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif']; // Extensiones válidas
  
    // Verifica si la extensión es válida
    if (validExtensions.includes(fileExtension)) {
      return callback(null, true); // Permite el archivo si es válido
    } else {
      return callback(new Error('Invalid file type. Only image files are allowed.'), false); // Rechaza el archivo si no es válido
    }
  };
  