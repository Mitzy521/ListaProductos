import React, { useEffect, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// Importación de la librería React, hooks, jsPDF y html2canvas.

function About() {
  const [nombre, setNombre] = useState('');
  const [producto, setProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [marca, setMarca] = useState('');
  const [material, setMaterial] = useState('');
  const [imagen, setImagen] = useState(null);
  const [itens, setItens] = useState([]);
  const [id, setId] = useState();
  // Definimos estados para el manejo de nombre, producto, precio, imagen e id.
  const modalRef = useRef(null);
  const tbodyRef = useRef(null);
  const pdfRef = useRef(null);
  // Definimos referencias para el modal, el tbody y el contenedor del PDF.

  useEffect(() => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) ?? [];
    const usuarioActual = usuarios[usuarios.length - 1];
    if (usuarioActual) {
      setNombre(usuarioActual.nombre);
    }
  }, []);
  // Recuperamos el usuario actual de localStorage y actualizamos el estado de nombre.

  useEffect(() => {
    loadItens();
  }, []);
  // Cargamos los items (productos) desde localStorage.

  const openModal = (edit = false, index = 0) => {
    modalRef.current.classList.add('active');
    modalRef.current.onclick = e => {
      if (e.target.className.indexOf('modal-container') !== -1) {
        modalRef.current.classList.remove('active');
      }
    };
    // Abre el modal para agregar o editar un producto.

    if (edit) {
      setProducto(itens[index].producto);
      setPrecio(itens[index].precio);
      setMarca(itens[index].marca);
      setMaterial(itens[index].material);
      setImagen(itens[index].imagen);
      setId(index);
    } else {
      setProducto('');
      setPrecio('');
      setMarca('');
      setMaterial('');
      setImagen(null);
    }
    // Si se trata de una edición, carga los datos del producto.
  };

  const editItem = index => {
    openModal(true, index);
  };
  // Abre el modal para editar el producto en la posición index.

  const deleteItem = index => {
    const newItens = itens.slice();
    newItens.splice(index, 1);
    setItens(newItens);
    setItensBD(newItens);
    loadItens();
  };
  // Elimina el producto en la posición index de la lista y actualiza localStorage.

  const insertItem = (item, index) => {
    return (
      <tr key={index}>
        <td>
          {item.imagen && <img src={item.imagen} alt="Producto" style={{ width: '150px', height: '150px' }} />}
        </td>
        <td>{item.producto}</td>
        <td>{item.precio}</td>
        <td>{item.marca}</td>
        <td>{item.material}</td>
        <td className="acao">
          <button onClick={() => editItem(index)}><i className='bx bx-edit'></i></button>
        </td>
        <td className="acao">
          <button onClick={() => deleteItem(index)}><i className='bx bx-trash'></i></button>
        </td>
      </tr>
    );
    // Crea una fila para cada producto con botones para editar y eliminar.
  };

  const handleSave = e => {
    e.preventDefault();
    if (producto === '' || precio === '' || marca === '' || material === '') {
      return;
    }

    const newItens = [...itens];

    if (id !== undefined) {
      newItens[id] = { producto, precio, marca, material, imagen };
    } else {
      newItens.push({ producto, precio, marca, material, imagen });
    }
    // Comprueba que los diferentes campos estén completos para poder guardar el producto.

    setItens(newItens);
    setItensBD(newItens);

    modalRef.current.classList.remove('active');
    loadItens();
    setId(undefined);
  };
  // Guarda un nuevo producto o actualiza uno ya existente, luego cierra el modal y recarga los items.

  const loadItens = () => {
    const storedItens = getItensBD();
    setItens(storedItens);
  };
  // Carga los items desde localStorage y actualiza el estado.

  const getItensBD = () => JSON.parse(localStorage.getItem('dbfunc')) ?? [];
  // Obtiene los items desde localStorage o devuelve un array vacío si no hay.

  const setItensBD = itens => localStorage.setItem('dbfunc', JSON.stringify(itens));
  // Guarda los items en localStorage.

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        setImagen(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // Maneja el cambio de imagen y la convierte a una URL de datos.

  const generatePDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4'); // Configura el tamaño del PDF (A4 en puntos)
    
    // Título del PDF
    doc.setFontSize(20);
    doc.setTextColor(102, 51, 153); // Rebecca Purple
    doc.text('The Purple Shine', 200, 40);
  
    // Subtítulo del PDF
    doc.setFontSize(14);
    doc.setTextColor(147, 112, 219); // Medium Purple
    doc.text('Productos disponibles:', 40, 70);
  
    itens.forEach((item, index) => {
      const yPosition = 100 + (index * 100); // Ajusta la posición vertical para cada producto
  
      // Fondo del producto
      doc.setFillColor(171, 141, 189);
      doc.rect(30, yPosition - 20, 540, 90, 'F'); // Dibuja un rectángulo de fondo
  
      // Agrega el texto del producto
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Negro
      doc.text(`Producto: ${item.producto}`, 40, yPosition);
      doc.text(`Precio: ${item.precio}`, 40, yPosition + 20);
      doc.text(`Marca: ${item.marca}`, 40, yPosition + 40);
      doc.text(`Material: ${item.material}`, 40, yPosition + 60);
  
      // Agrega la imagen del producto
      if (item.imagen) {
        doc.addImage(item.imagen, 'JPEG', 400, yPosition - 15, 80, 80); // Ajusta la posición y tamaño de la imagen
      }
    });
  
    doc.save('productos.pdf');
  };

  return (
    <div className="l2-form">
      <h1 className="form__title2">The Purple Shine</h1>

      <div className="container2">
        <div className="header">
          <span>Productos disponibles</span>
          <button onClick={() => openModal()} id="btn-add">+</button>
        </div>

        <div className="divTable" ref={pdfRef}>
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Marca</th>
                <th>Material</th>
                <th className="acao">Editar</th>
                <th className="acao">Eliminar</th>
              </tr>
            </thead>
            <tbody ref={tbodyRef}>
              {itens.map((item, index) => insertItem(item, index))}
            </tbody>
          </table>
        </div>

        <div className="modal-container" ref={modalRef}>
          <div className="modal">
            <form onSubmit={handleSave}>
              <label htmlFor="m-producto">Producto</label>
              <input id="m-producto" type="text" value={producto} onChange={e => setProducto(e.target.value)} required />

              <label htmlFor="m-precio">Precio</label>
              <input id="m-precio" type="number" value={precio} onChange={e => setPrecio(e.target.value)} required />

              <label htmlFor="m-marca">Marca</label>
              <input id="m-marca" type="text" value={marca} onChange={e => setMarca(e.target.value)} required />

              <label htmlFor="m-material">Material</label>
              <input id="m-material" type="text" value={material} onChange={e => setMaterial(e.target.value)} required />

              <label htmlFor="m-imagen">Imagen</label>
              <input id="m-imagen" type="file" accept="image/*" onChange={handleImageChange} />

              <button id="btnGuardar">Guardar</button>
            </form>
          </div>
        </div>

        <div className="contacto">
          <h4 className='info'>Para más Información</h4>
          <a href="https://wa.me/45243348" target="_blank" className="contacto">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/479px-WhatsApp.svg.png" alt="imagen" className='what-logo'/>
          </a>
        </div>

        <button onClick={generatePDF} className="btn-pdf">Descargar PDF</button>
      </div>
    </div>
  );
  // Muestra la bienvenida junto al nombre de la persona.
  // Muestra los componentes por los que los productos estarán compuestos.
  // Crea los botones de forma visible.
}

export default About;
// Exportamos la función para que pueda ser utilizada en otras ocasiones.