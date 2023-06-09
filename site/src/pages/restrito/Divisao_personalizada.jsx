import LateralMenu from "../../components/Lateral_menu";
import styles from "../../_assets/css/modules/divisao modules/divisao_pers.module.css";
import voltar from "../../_assets/img/icons/setaVoltar.png";
import Card from "../../components/Card"; 
import { useEffect, useState } from "react";
import api from "../../config/api";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

function Divisao_personalizada() {
  const [itens, setItens] = useState([]);
  const [corpoCalculo, setCorpoCalculo] = useState({});
  // const [total, setTotal] = useState();
  const { state } = useLocation();


  const navigate = useNavigate();

  function getValotTotal(itens) {
    return itens
      .map((item) => item.produto.preco)
      .reduce((total, precoItem) => total + precoItem, 0);
  }

  function getItens() {
    api
      .get("itens-comanda/todos/pedido/" + sessionStorage.pedidoAtual)
      .then((response) => {
        setItens(response.data);
        corpoCalculo.itens = [];
        for (const item of response.data) {
          corpoCalculo.itens.push({
            id: item.id,
            nome: item.produto.nome,
            preco: item.produto.preco,
            donoOriginal: item.nomeDono,
            isValid: true,
            pagantes: [
              { idComanda: item.idComanda, nome: item.nomeDono, valorAPagar: item.produto.preco },
            ],
          });
        }
        corpoCalculo.valorTotal = getValotTotal(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          console.log("Este endpoint não existe");
        } else {
          console.error(err);
        }
      });
  }

  function onAddPagante(itemId, nomePagante, valor, idComanda) {
    for (const item of corpoCalculo.itens) {
      if (itemId === item.id) {
        item.pagantes.push({
          nome: nomePagante,
          valorAPagar: valor,
          idComanda : idComanda,
        });
      }
    }
  }

  function onValorChange(itemId, nomePagante, valor, isValid) {
    for (const item of corpoCalculo.itens) {
      if (item.id === itemId) {
        for (const pagante of item.pagantes) {
          if (pagante.nome === nomePagante) {
            pagante.valorAPagar = Number(valor);
          }
        }
        item.isValid = isValid;
      }
    }
  }

  function areAllCardsValid() {
    for (const item of corpoCalculo.itens) {
      if (!item.isValid) {
        return false;
      }
    }
    return true;
  }

  function calc() {
    if (!areAllCardsValid()) {
      Swal.fire("Valores inválidos!", "", "warning");
      return;
    }
    api
      .post("calculos/calculo-personalizado", corpoCalculo)
      .then((response) => {
        console.log(response)
        navigate("/totalDivisao", { state: {resposta : response.data, personaliz : true, mesa : state.mesa} })
      })
      .catch((err) => {
        if (err.response.status === 404) {
          console.log("Este endpoint não existe");
        } else {
          console.error(err);
        }
      });


  }

  useEffect(() => {
    getItens();
  }, []);

  if (sessionStorage.length > 0) {
    return (
      <div className="fBody">
        <link
          rel="stylesheet"
          href="../../_assets/css/modules/divisao_pers.module.css"
        ></link>
        <script src="../../_assets/js/carrossel.js"></script>
        <LateralMenu />
        <div className={styles.main}>
          <div className={"voltar"} onClick={()=>{window.history.back()}}>
            <img src={voltar} alt="" />
            <p>voltar</p>
          </div>
          <div className={styles.container}>
            <div className={styles.container_head}>
              <p>Divisão Personalizada</p>
              <div className={styles.passagem}>
                <div className={styles.line}></div>
              </div>
            </div>
            <div className={styles.container_right}>
              <div className={styles.valor}>Valor total: </div>
              <div className={styles.total}>
                R$
                {getValotTotal(itens).toFixed(2)}
              </div>
            </div>
            <div className={styles.container_main}>
              {/* <div className={styles.carrossel}> */}
                <div className={styles.cards}>
                  {/* <ReactCardCarousel
                    autoplay={false}
                    autoplay_speed={2500}
                    spread="medium"
                  > */}
                    {itens
                      ? itens.map((item, i) => {
                        return (
                          <Card
                            key={i}
                            item={item}
                            onAddPagante={onAddPagante}
                            onValorChange={onValorChange}
                          />
                         );
                      })
                      : ""} 
                  {/* </ReactCardCarousel> */}
                </div>
              {/* </div> */}
            </div>

            <div className={styles.buttons}>
              <button className={styles.btnSingular} onClick={()=>{window.history.back()}}>Voltar</button>
              <button onClick={calc}>Pagar</button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    window.location.href = "http://localhost:3000/login";
  }
}

export default Divisao_personalizada;
