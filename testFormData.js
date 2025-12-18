// PRUEBA SIMPLE DE MULTIPART
// Ejecutar en el frontend para ver QUÉ se está enviando
// Copiar y pegar en la consola de Metro Bundler

const testFormData = async () => {
    console.log('🧪 === INICIANDO TEST DE FORMDATA ===');

    // Simular imagen
    const testImage = {
        uri: 'file:///storage/emulated/0/DCIM/test.jpg',
        name: 'test.jpg',
        type: 'image/jpeg'
    };

    console.log('📝 Imagen de prueba:', testImage);

    // Crear FormData
    const formData = new FormData();
    formData.append('title', 'Test de imagen');
    formData.append('content', 'Contenido de prueba');
    formData.append('category', 'alert');
    formData.append('isPublished', 'false');
    formData.append('image', testImage);

    console.log('📦 FormData creado');
    console.log('📦 Tipo de FormData:', formData.constructor.name);
    console.log('📦 Tiene método _parts?:', !!formData._parts);

    if (formData._parts) {
        console.log('📦 Partes del FormData:');
        formData._parts.forEach((part, index) => {
            console.log(`  ${index}:`, part);
        });
    }

    // Intentar enviar (SIN headers manuales)
    try {
        console.log('🚀 Enviando a backend...');
        const response = await api.post('/news', formData);
        console.log('✅ Respuesta:', response);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('❌ Response data:', error.response?.data);
    }
};

// Ejecutar test
testFormData();
