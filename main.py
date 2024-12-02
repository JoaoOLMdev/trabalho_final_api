import requests
import matplotlib.pyplot as plt
import numpy as np
import pwinput # type: ignore

url = "http://localhost:3000/position"
url_login = "http://localhost:3000/Login"

user_id = ""
token = ""

def title(text, trace="-"):
    print()
    print(text)
    print(trace * 40)

def login():
    title("Login do Usuário")

    email = input("E-mail: ")
    password = pwinput.pwinput(prompt="Senha: ")

    response = requests.post(url_login, json={"email": email, "password": password})

    if response.status_code == 200:
        response_login = response.json()
        global user_id
        global token
        user_id = response_login["id"]
        token = response_login["token"]
        print(f"Login efetuado com sucesso! {response_login['name']}")
    else:
        print("Erro ao efetuar login")


def inclusion():
    title("Inclusão de Posição")

    if token == "":
        print("Usuário não logado")
        return
    
    positionName = input("Nome do Cargo que deseja inserir: ")
    salary = float(input("Salário do Cargo: "))
    userId = int(input("Id do Usuário que assumirá o cargo: "))

    response = requests.post(url,
                             headers={"Authorization": f"Bearer {token}"},
                             json={"positionName": positionName, "salary": salary, "userId": userId})
    
    if response.status_code == 200:
        position = response.json()
        print(f"Cargo {position['positionName']} inserida com sucesso!")

    else:
        print("Erro ao inserir Cargo")


def list_positions():
    title("Listagem de Posições")

    response = requests.get(url)

    if response.status_code != 200:
        print("Erro ao buscar cargos")
        return

    positions = response.json()

    print("Cargo.........: Salário........: Usuário...:")
    print("-" * 50)
    for position in positions:
        print(f"{position['positionName']}, {position['salary']}, {position['userId']},")


def change():
    list_positions()

    if token == "":
        print("Usuário não logado")
        return
    
    id = int(input("Id do Cargo que deseja alterar: "))

    response = requests.get(url)
    positions = response.json()
    position = [x for x in positions if x['id'] == id]

    if len(position) == 0:
        print("Cargo não encontrado")
        return
    
    print (f"Nome do Cargo: {position[0]['positionName']}")
    print (f"Salário: {position[0]['salary']}")
    print (f"Usuário: {position[0]['userId']}")

    newSalary = input("Nome do Cargo que deseja alterar o Salário: ")

    response = requests.put(url+"/"+str(id),
                            headers={"Authorization": f"Bearer {token}"},
                            json={"salary": newSalary})
    
    if response.status_code == 200:
        position = response.json()
        print(f"Cargo {position['position_name']} alterado com sucesso!")
    else:
        print("Erro ao alterar Cargo")


def delete():
    if token == "":
        print("Usuário não logado")
        return
    
    list_positions()

    id = int(input("Id do Cargo que deseja excluir: (0: sair!)?"))

    if id == 0:
        return
    
    reponse = requests.get(url)
    positions = reponse.json()

    position = [x for x in positions if x['id'] == id]

    if len(position) == 0:
        print("Cargo não encontrado")
        return
    
    print (f"Nome do Cargo: {position[0]['positionName']}")
    print (f"Salário: {position[0]['salary']}")
    print (f"Usuário: {position[0]['userId']}")

    confirm = input("Confirma a exclusão do Cargo? (s/n)").upper()

    if confirm == "S":
        response = requests.delete(url+"/"+str(id),
                                   headers={"Authorization": f"Bearer {token}"})
        
        if response.status_code == 200:
            position = response.json()
            print("Cargo excluído com sucesso!")
        else:
            print("Erro ao excluir Cargo")


def grafic():
    response = requests.get(url)

    if response.status_code != 200:
        print("Erro ao buscar cargos")
        return
    
    positions = response.json()
    categories = ["Até 5k", "Entre 5k e 10k", "Acima de 10k"]
    count = [0, 0, 0]

    for position in positions:
        salario = int(position['salary'])
        if salario <= 5000:
            count[0] += 1
        elif 5000 < salario <= 10000:
            count[1] += 1
        else:
            count[2] += 1

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(categories, count, color=['#4CAF50', '#FFC107', '#F44336'])

    ax.set_title("Distribuição de Salários", fontsize=14)
    ax.set_xlabel("Faixas de Salário", fontsize=12)
    ax.set_ylabel("Quantidade de Posições", fontsize=12)
    ax.grid(axis='y', linestyle='--', alpha=0.7)
    
    plt.tight_layout()
    plt.show()


def grafic2():
    pass

while True:
    title("Cadastro de Veículos")
    print("1. Login do Usuário")
    print("2. Inclusão de Cargo")
    print("3. Listagem de Cargos")
    print("4. Alteração de Salário")
    print("5. Exclusão de Cargo")
    print("6. Gráfico salário (Colunas)")
    print("7. Gráfico de Marcas (Colunas Empilhadas)")
    print("8. Finalizar")
    opcao = int(input("Opção: "))
    if opcao == 1:
        login()
    elif opcao == 2:
        inclusion()
    elif opcao == 3:
        list_positions()
    elif opcao == 4:
        change()
    elif opcao == 5:
        delete()
    elif opcao == 6:
        grafic()
    elif opcao == 7:
        grafic2()
    else:
        break