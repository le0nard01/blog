---
useFolks: true
subjects: ["openstack","all-in-one","single node"]
title: "OpenStack - Single Node"
language: "pt-br"
translations: ["pt-br"]
date: "2021-07-02T14:30:00.999Z"
description: "Instalação do OpenStack na mão, All-In-One e com Single NIC"
---

# Openstack All-In-One *from Scratch*

## Inicio

###### *[Github](https://github.com/le0nard01) | [Linkedin](https://www.linkedin.com/in/leonardooste/) | [Telegram](https://t.me/le0nard01)*

Tive resquícios de contato com o OpenStack nestes últimos tempos, após este curto entendimento sobre este *IaaS (Infraestrutura como serviço)*, tive a necessidade de explorar , pois me despertou certa curiosidade e interesse no assunto. E com um excelente adendo ao meu interesse, um projeto **Open Source**.

Eu levo um dilema de tentar tudo *From Scratch*, para a melhor compreensão possível (Não só para T.I, mas para tudo), então a ideia era subir um **OpenStack by Hand**, sem utilizar *PackStack/DevStack/Kolla* (Script de automação de Deploy do OpenStack) ou similares.

Foram 7 dias desde a primeira tentativa de subir um OpenStack, mas eu já estava estudando o funcionamento uns dias antes. Enfrentei algumas boas dificuldades no caminho, principalmente procurando as soluções para meus problemas ou dúvidas, se tratando de um **Single-Node com Single-NIC (Network Interface Card)** com o OpenStack na versão **Wallaby** com virtualização **KVM** no **Centos 8 - Stream**.

Queria recomendar o blog do [Anomized](https://diesec.home.blog/) que me ajudou dar o primeiro passo, e tem bastante conteúdo bacana sobre Pentest e Jornadas de Certificações. 

### Notas

Este artigo replica em grande parte a documentação oficial do OpenStack, com algumas diferenças, alguns processos a mais para correção de bug's ou para configuração baseado no projeto Single-NIC All-in-one, então eu recomendo que leia este artigo juntamente com a leitura da documentação. Vou citar os principais pontos que diferem da documentação: 

```properties
- Ambiente: Desativar IPv6, Desabilitar SELINUX, Host se chamará openstack ao invés de controller. Memcached remove opção ::1 das configurações.
- Keystone: Configuração e instalação parecidas (Pode seguir a Doc).
- Glance: Configuração e instalação parecidas (Pode seguir a Doc). 
- Placement: Instalação igual, configuração parcialmente diferente, resolução de bug (Pode seguir a Doc + resolução de bug).
- Nova: Instalação e configuração parecidas, diferença é que a configuração é feita na mesma maquina e não no nó de compute e no controller (Pode seguir a doc).
- Neutron: Instalação igual, configuração diferente, não está na Documentação inicial.
```

### Dicas prévias

Vou passar algumas dicas e scripts que podem ajudar durante o processo, são muitos comandos repetidos e uns **aliases** ajudam na digitação *(Principalmente o alias do egrep)*:

```bash
alias s="sudo systemctl " 
alias d="sudo dnf install -y " # Instalar pacotes e aceitar, só digitar "d pacote pacote2"
alias scat="sudo cat " 
alias snano="sudo nano " 
alias ccat="sudo egrep -v '^\s*(#|$)' " # Comando para ler arquivos de configurações sem os comentarios, assim fica mais limpo de ve e configurar.
```

## Estrutura 

A estrutura do OpenStack é bem subdividida em diversas API, e cada uma cuida de um setor dentro do eco-sistema, comumente muito bem interligadas. Darei uma breve explicação de cada nesta seção.

<img src="https://object-storage-ca-ymq-1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/openstack-map/openstack-map-v20210201.svg" style="zoom:80%;" />

Cada serviço possui uma atividade dentro do ambiente, que irá fazer interação com outro componente, atrelando ou aprimorando novas funções. Desde os componentes vitais para o funcionamento, como o serviço de computação que de fato irá virtualizar as Instancias, ou como serviços de monitoração, que irá monitorar o funcionamento/desempenho das virtualizações.

Dentro do escopo de serviços vitais para o funcionamento mínimo do OpenStack, há apenas 5 serviços: Serviço de identidade (**keystone**), Serviço de Imagem (**glance**), Serviço de Recurso (**placement**), Serviço de Computação (**nova**), Serviço de Redes (**neutron**). Com o funcionamento desses serviços é possível fazer o Deploy de uma instância. 

### Pré-Requisitos

Estarei subindo o projeto em uma máquina com as seguintes configurações: 

```properties
Máquina:
- Processador Intel® Core™ i7-4770K
- Memoria RAM 16GB DDR3
- HDD 1TB

Distro Linux: CentOS 8 - Stream

Partições:
  - /boot     1G EXT4  
      /boot/efi 512M EFI  
  LVM:  
    /home 10G EXT4  
    /    320G EXT4  
    
Rede:
- enp5s0:
    Range:   192.168.15.0/24
    Meu ip:  192.168.15.15
    Gateway: 192.168.15.1
    Mascara: 255.255.255.0

```

Lembrando que, para virtualizações *Bare-Metal*, é necessário conferir se seu processador possui a tecnologia de  virtualização, VT-x para processadores Intel e AMD-V para processadores AMD. Essa opção pode vir desabilitada dentro da BIOS, é necessário verificar. E dentro do Linux, é possível rodar o comando `egrep ‘(vmx|svm)’ /proc/cpuinfo` para ver se é possível virtualizar (Caso já esteja ativo na BIOS). É possível ter uma certeza também via site do fabricante. 

Estarei utilizando a principio 16 GB de RAM e 330GB de HDD, mas com mais espaço disponível dentro do disco. As partições estão em LVM, para futuras mudanças de espaço das mesmas. Recomendo a utilização de EXT4 ao invés de XFS. Em um ambiente de testes como o meu, é possível utilizar menos recursos.

## Ambiente

###### [A instalação é parecida com a documentação](https://docs.openstack.org/install-guide/environment.html)

É necessário preparar nossa máquina antes, fazendo alguns ajustes, antes de começar instalação do OpenStack.

Primeiro, vamos criar um usuário que irá manusear todos os processos, não é bom criar o ambiente com usuário root, *(a primeira tentativa minha eu fiz assim, criei tudo com o user root, e no final não deu certo)*. Utilizarei o usuário leonardo para manipular:

```bash
useradd leonardo -m -U -s /bin/bash
```

E adicionar o usuário ao /etc/sudoers para liberar o uso do **sudo **e após isso sempre utilizar ele:

```bash
echo "leonardo  ALL=(ALL)  NOPASSWD: ALL" >> /etc/sudoers
```

Após isso, vamos desativar alguns serviços que o OpenStack não lida bem. Primeiro o **firewalld** e substituir pelo iptables:

```sh
systemctl disable firewalld
systemctl stop firewalld
```

E instalar o **iptables**:

```bash
dnf install -y iptables-services
systemctl enable iptables
systemctl start iptables
```

**Network Manager** e substituir pelo **network-scripts**, pois o OpenStack não lida bem com o Network Manager, vamos instalar o network-scripts antes (caso não esteja instalado), após isso configurar ambos serviços:

```bash
dnf install -y network-scripts
systemctl enable network
systemctl disable NetworkManager
systemctl stop NetworkManager;sudo systemctl start network # Reiniciará a conexão
```

Não se esqueça de configurar os arquivos **/etc/sysconfig/network-scripts/ifcfg-INTERFACE** neste padrão:

```properties
TYPE=Ethernet
BOOTPROTO=none #IP Estatico
DEFROUTE=yes
IPADDR=192.168.15.15
NETMASK=255.255.255.0
GATEWAY=192.168.15.1
UUID=8bdxxxx-xxxx-xxxx-xxxx-xxxxxxxx403a
DEVICE=enp5s0
NAME=enp5s0
NM_CONTROLLED=no
PEERDNS=no
ONBOOT=yes	
```

Também configurar o **hostname**:

```bash
hostnamectl set-hostname openstack 
```

E o arquivo **/etc/hosts**:

```properties
127.0.0.1		localhost
192.168.15.15	openstack	# Será utilizado em todos processos.
```

Recomendo também desabilitar IPv6 também, tive uns problemas com ele habilitado. Adicione estes parâmetros dentro do arquivo **/etc/sysctl.conf**:

```bash
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
```

E execute um `sysctl -p`.  Também tive problemas com o SELINUX, então desative-o alterando a opção do **SELINUX** em **/etc/selinux/config** para **disabled**: 

```properties
sudo nano /etc/selinux/config
# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=disabled
```

Após estas configurações, executar um *reboot* no servidor e verifique se há internet com um *ping 8.8.8.8*.

### Preparando OpenStack

Iremos ativar o repositório do **OpenStack** **Wallaby** (Versão que iremos utilizar durante a instalação) e também o repositório **powertools**. E rodar um *update* após:

```bash
dnf install centos-release-openstack-wallaby
dnf config-manager --set-enabled powertools
dnf update -y
```

Depois instalar o Client do OpenStack, utilizado para fazer todo o manuseio e configuração do IaaS: 

```bash
dnf install python3-openstackclient
```

###### ***Notas:***

*Eu recomendo vocês sempre testarem os serviços após a instalação, com o **systemctl status**, ou com alguma forma dentro da tool, para testar o funcionamento. Eu tive muitos problemas simples que desencadearam problemas complexos, que me fizeram perder muito tempo.*

##### *SQL (MariaDB):*

Primeiramente instale os pacotes do **MariaDB** e do **PyMySQL**:

```bash
dnf install mariadb mariadb-server python2-PyMySQL python3-PyMySQL
```

Crie e edite o arquivo **/etc/my.cnf.d/openstack.cnf** com as seguintes informações:

```properties
[mysqld]
bind-address = 192.168.15.15 # IP dá Maquina

default-storage-engine = innodb
innodb_file_per_table = on
max_connections = 4096
collation-server = utf8_general_ci
character-set-server = utf8
```

Finalize a instalação ativando e iniciando os serviços:

```bash
systemctl enable mariadb.service
systemctl start mariadb.service
```

e configurando o root do mysql:

```bash
mysql_secure_installation
```

##### *Message Queue (RabbitMQ)*

O OpenStack interpreta além do RabbitMQ, os mensageiros Qpid e ZeroMQ. Vamos utilizar o RabbitMQ nesta ocasião, instale-o:

```bash
dnf install rabbitmq-server
```

Habilite e inicie os serviços:

```bash
systemctl enable rabbitmq-server.service
systemctl start rabbitmq-server.service
```

Adicione o usuário **openstack** aonde o RABBIT_PASS é a senha a ser utilizada:

```bash
rabbitmqctl add_user openstack RABBIT_PASS
```

E conceda-o todas permissões necessarias:

```bash
rabbitmqctl set_permissions openstack ".*" ".*" ".*"
```

##### *Memcached*

Eu tive alguns problemas com o Memcached seguindo as instruções da documentação por não estar utilizando IPv6, então irei adicionar mais alguns processos durante esta instalação. Primeiro faça a instalação do pacote:

```bash
dnf install memcached python3-memcached
```

Configure o campo OPTIONS no arquivo /etc/sysconfig/memcached para escutar seu IP de LAN:

```properties
PORT="11211"
USER="memcached" 
MAXCONN="1024"
CACHESIZE="64"
OPTIONS="-l openstack,127.0.0.1"
```

Pela [documentação](https://docs.openstack.org/install-guide/environment-memcached-rdo.html) ele utiliza no campo **OPTIONS** o valor **::1**, que faz referencia ao IPv6, como estamos com o mesmo desabilidade, é necessário retirar este valor no **OPTIONS**, eu acabei perdendo um tempo com isso. Habilite e inicie o serviço:

```bash
systemctl enable memcached.service
systemctl start memcached.service
```

Para verificar o funcionamento, utilize o comando `memcached-tool openstack:11211 stats`, caso ele não retorne *"Couldn't connect to openstack:11211"*, então está funcionando. *(É recomendável também utilizar o systemctl status memcached para verificar)*

##### *Etcd*

Bem fácil a instalação, assim como os serviços anteriores, vamos primeiro instalar o pacote:

```bash
dnf install etcd
```

Após a instalação, vamos configurar o **Etcd** pelo arquivo **/etc/etcd/etcd.conf** *(Dá pra confundir com tanto "etc")*, e mudar as opções abaixo:

```properties
#[Member]
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="http://192.168.15.15:2380"
ETCD_LISTEN_CLIENT_URLS="http://192.168.15.15:2379"
ETCD_NAME="openstack"

#[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="http://192.168.15.15:2380"
ETCD_ADVERTISE_CLIENT_URLS="http://192.168.15.15:2379"
ETCD_INITIAL_CLUSTER="openstack=http://192.168.15.15:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster-01"
ETCD_INITIAL_CLUSTER_STATE="new"
```

Lembrando que estou utilizando o IP 192.168.15.15, não esqueça de alterar. E também é importante ressaltar a verificação de duplicidades nas configurações. *(Acredito que o Etcd não faça resolução de host, irei testar tal fato)*. 

Finalize a instalação iniciando o serviço:

```bash
systemctl enable etcd
systemctl start etcd
```

##### *Finalização*

Verifique novamente o funcionamento dos serviços, certifique-se de que esta tudo **active (running)**, caso ocorra algum erro nos serviços, verifique os logs e o **jornalctl**, recomendo também verificar os status de todos os serviços e ver se há algum falhando:

```bash
systemctl status etcd memcached mysql rabbitmq-server
systemctl #Verificar todos os serviços
```

Não se esqueça de **não instalar nenhum serviço como root**, e sempre **evite utilizar sudo**, só utilize quando há a necessidade de permissões elevadas para executar/editar algo.

## Keystone

###### [A instalação é parecida com a documentação](https://docs.openstack.org/keystone/wallaby/install/index-rdo.html)

O Keystone é serviço de autenticação do OpenStack, ele orquestra as autenticações, politicas, tokens, domínios, entre outros. Ele que define quais serviços podem realizar tais comunicações com outros, ele é como um Firewall entre todas as comunicações dentro do OpenStack. Por exemplo: Um usuário X faz uma requisição para deletar/modificar uma instancia Y, quem faz está verificação se ele está autorizado a executar tais ações, é o keystone. Tudo isto através de uma REST API, uma API Web, que roda encima de um Apache, como mostra o diagrama abaixo:

![OpenStack Keystone architecture | Download Scientific Diagram](https://www.researchgate.net/profile/Carlos-Da-Silva-17/publication/327680691/figure/fig3/AS:671532485468170@1537117229732/OpenStack-Keystone-architecture.png)

##### *Pré-requisitos*

Vamos começar a instalação criando um banco de dados e um usuário para este serviço (A maioria dos serviços precisam de um banco de dados próprio, então este processo se repete diversas vezes), primeiramente acesse o MySQL CLI com a senha cadastrada via `mysql_secure_installation`:

```bash
mysql -u root -p
```

Crie um banco de dados para o keystone, e também garanta todos os privilégios deste banco para o usuário keystone, o valor KEYSTONE_DBPASS é a senha a ser utilizada na conexão pelo usuário keystone:

```mariadb
MariaDB [(none)]> CREATE DATABASE keystone;
MariaDB [(none)]> GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'localhost' \
IDENTIFIED BY 'KEYSTONE_DBPASS';
MariaDB [(none)]> GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'%' \
IDENTIFIED BY 'KEYSTONE_DBPASS';
```

##### *Instalação e configuração*

Primeiramente instale o pacote do keystone, apache e do WSGI:

```bash
dnf install openstack-keystone httpd python3-mod_wsgi
```

Iremos configurar o arquivo **/etc/keystone/keystone.conf** e irei explicando as opções pelos blocos:

```properties
# Documentação deste arquivo config: 
# https://docs.openstack.org/keystone/wallaby/configuration/config-options.html

[database]
# connection é a conexão com o mysql via SQLAlchemy, altere o KEYSTONE_DBPASS de acordo com a senha colocada.
connection = mysql+pymysql://keystone:KEYSTONE_DBPASS@openstack/keystone

[token]
# é o meio de gerar e orquestrar os tokens, atualmente há suporte para Fernet e JWS, mais informações acesse https://docs.openstack.org/keystone/wallaby/admin/tokens-overview.html#token-providers
provider = fernet
```

Após isto, execute o seguinte comando para estruturar o banco de dados do keystone:

```bash
sudo su -s /bin/sh -c "keystone-manage db_sync" keystone
```

Inicialize os repositórios do **Fernet**:

```bash
keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone
keystone-manage credential_setup --keystone-user keystone --keystone-group keystone
```

Crie o serviço de identidade, o campo **ADMIN_PASS** é a senha de administrador a ser utilizada pelo usuário admin: 

```bash
keystone-manage bootstrap --bootstrap-password ADMIN_PASS \
  --bootstrap-admin-url http://openstack:5000/v3/ \
  --bootstrap-internal-url http://openstack:5000/v3/ \
  --bootstrap-public-url http://openstack:5000/v3/ \
  --bootstrap-region-id RegionOne
```

##### *Configuração do Apache e Finalização*

Edite o arquivo **/etc/httpd/conf/httpd.conf** e configure o *ServerName* igual ao host configurado anteriormente (Verifique se o campo já está ativo, ou crie-o):

```properties
ServerName openstack
```

Também crie um link das configurações wsgi do keystone para dentro da pasta de configurações do Apache:

```bash
ln -s /usr/share/keystone/wsgi-keystone.conf /etc/httpd/conf.d/
```

Após as configurações, inicialize o serviço do Apache e certifique-se do seu funcionamento:

```bash
systemctl enable httpd
systemctl start httpd
systemctl status httpd #Verifique se está rodando.
```

Crie um arquivo **adminrc** com os dados abaixo, o keystone trata as autenticações por variáveis de ambiente *(environment variable)*, anteriormente configurado com o comando `keystone-manager bootstrap`:

```bash
export OS_PROJECT_DOMAIN_NAME=Default
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_NAME=admin
export OS_USERNAME=admin
export OS_PASSWORD=ADMIN_PASS #Senha utilizada no keystone-manager bootstrap
export OS_AUTH_URL=http://openstack:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
```

### *Criando domain, projects, users e roles*

*Domain, projects, users e roles* é a base da arquitetura de identificação do keystone, recomendo a leitura da [documentação da arquitetura](https://docs.openstack.org/keystone/wallaby/getting-started/architecture.html) para uma compreensão melhor e necessária, irei criar os campos baseado na documentação de instalação básica.

Primeiramente, execute um **". adminrc"** para importar as variáveis para seu ambiente, para poder executar os comandos do openstack-cli.

Utilizaremos o domain default, que já existe por padrão. Criaremos um projeto de serviço, para utilização dos serviços: 

```bash
openstack project create --domain default --description "Service Project" service
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | Service Project                  |
...
```

Utilizarei neste artigo o projeto **myproject** e o usuário **myuser**, assim como a documentação, primeiramente crie o projeto **myproject** e após, crie o usuário **myuser**, e coloque a senha no valor MYUSER_PASS *(Não se esqueça de anotar a senha)*:

```bash
$ openstack project create --domain default --description "Projeto demo" myproject
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | Demo Project                     |
...

$ openstack user create --domain default --password MYUSER_PASS myuser
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
...
```

Após isso, crie a role **myrole** e adicione no projeto **myproject** e no user **myuser**:

```bash
$ openstack role create myrole

+-----------+----------------------------------+
| Field     | Value                            |
+-----------+----------------------------------+
| domain_id | None                             |
...

$ openstack role add --project myproject --user myuser myrole
```

Por ultimo, crie um arquivo **userrc**, igual ao **adminrc**, mas com os dados do myuser. E depois verifique o funcionamento do keystone:

```bash
export OS_PROJECT_DOMAIN_NAME=Default
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_NAME=myproject
export OS_USERNAME=myuser
export OS_PASSWORD=MYUSER_PASS #Insira a senha colocada na criação.
export OS_AUTH_URL=http://openstack:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
```

Execute um **". userrc"** e tente gerar um token para testar o funcionamento:

```bash
$ . userrc
$ openstack token issue 

+------------+-----------------------------------------------------------------+
| Field      | Value                                                           |
+------------+-----------------------------------------------------------------+
| expires    | 2021-07-25T00:18:49+0000                                        |
| id         | gAAAAABWvjYj-Zjfg8WXFaQnUd1DMYTBVrKw4h3fIagi5NoEmh21U72SrRv2trl |
...
```

## Glance
###### [A instalação é parecida com a documentação](https://docs.openstack.org/glance/wallaby/install/install-rdo.html)

Glance é o serviço do OpenStack que vai gerenciar as imagens, ele faz o upload das imagens e libera as mesmas para as instancias, ele é bem simples e de fácil entendimento. Por exemplo, você precisa fazer um deploy de uma instancia com Ubuntu, então é necessário subir a imagem do Ubuntu e providencia-o para a instância, isto é feito tudo por ele.

![img](https://static.packt-cdn.com/products/9781783986965/graphics/B0B01770_03_01.jpg)

##### *Pré-requisito*

Primeiramente acesse o MySQL CLI com a senha cadastrada via `mysql_secure_installation`:

```bash
mysql -u root -p
```

Crie um banco de dados para o glance, e também garanta todos os privilégios deste banco para o usuário glance, o valor GLANCE_DBPASS é a senha a ser utilizada na conexão pelo usuário glance:

```mariadb
MariaDB [(none)]> CREATE DATABASE glance;
MariaDB [(none)]> GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'localhost' \
  IDENTIFIED BY 'GLANCE_DBPASS';
MariaDB [(none)]> GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'%' \
  IDENTIFIED BY 'GLANCE_DBPASS';
```

Execute o **". adminrc"** para adentrar no usuário admin, após isso crie o user glance e substitua GLANCE_PASS pela senha do glance (Anote a senha, ela será utilizada nas configurações), também adicione o role admin ao glance:

```bash
$ openstack user create --domain default --password GLANCE_PASS glance
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
.

$ openstack role add --project service --user glance admin
```

Crie o glance service:

```bash
$ openstack service create --name glance --description "OpenStack Image" image
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | OpenStack Image                  |
...
```

Também crie os endpoints do serviço glance:

```bash
$ openstack endpoint create --region RegionOne image public http://openstack:9292

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne image internal http://openstack:9292

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne image admin http://openstack:9292

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...
```

##### *Instalação e Configuração*

Instale o pacote do glance:

```bash
dnf install openstack-glance
```

Configure o glance editando o arquivo **/etc/glance/glance-api.conf**,

```properties
# Documentação deste arquivo config:
# https://docs.openstack.org/glance/wallaby/configuration/glance_api.html

[database]
# connection é a conexão com o mysql via SQLAlchemy, altere o GLANCE_DBPASS.
connection = mysql+pymysql://glance:GLANCE_DBPASS@openstack/glance

[keystone_authtoken]
# Configurações de autenticação do serviço no keystone. Altere GLANCE_DBPASS
www_authenticate_uri  = http://openstack:5000
auth_url = http://openstack:5000
memcached_servers = openstack:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = glance
password = GLANCE_PASS

[paste_deploy]
# Meio de authenticação
flavor = keystone

[glance_store]
# Métodos de armazenamento.
stores = file,http
default_store = file
filesystem_store_datadir = /var/lib/glance/images/
```

Após isto, execute o seguinte comando para estruturar o banco de dados do glance:

```bash
sudo su -s /bin/sh -c "glance-manage db_sync" glance
```

Finalize a instalação ativando e iniciando o serviço do glance, também certifique-se do funcionamento do mesmo:

```bash
systemctl enable openstack-glance-api
systemctl start openstack-glance-api
systemctl status openstack-glance-api
```

Para testar o funcionamento do glance, vamos baixar a imagem do CirrOS e fazer um upload para o glance. Primeiro, execute um ". adminrc" e baixe a imagem do CirrOS com wget:

```bash
wget http://download.cirros-cloud.net/0.5.0/cirros-0.5.0-x86_64-disk.img
```

Após isso, vamos fazer o upload da imagem com o glance:

```bash
openstack image create "CirrOS 0.5.0 x86_64" \
		--file cirros-0.5.0-x86_64-disk.img \
		--disk-format qcow2 --container-format bare \
		--public
```

Para mais detalhes a usabilidade do glance, utilize a [documentação do glance](https://docs.openstack.org/python-openstackclient/wallaby/cli/command-objects/image-v2.html). Vamos rodar um `openstack image list` para verificar se a imagem está no banco de dados:

```bash
openstack image list
+--------------------------------------+---------------------+--------+
| ID                                   | Name                | Status |
+--------------------------------------+---------------------+--------+
| 19dfd76d-e690-45df-bf05-db62ccea82e9 | CirrOS 0.5.0 x86_64 | active |
+--------------------------------------+---------------------+--------+
```

## Placement

###### [A instalação é diferente da documentação](https://docs.openstack.org/placement/wallaby/install/install-rdo.html)

Este serviço irá gerenciar os recursos dos nós de computação (nova-compute) através de uma REST API, por exemplo, ela manuseia a liberação de vCPU, vGPU, Memoria RAM, Disco... para um projeto/instância. Ela foi originalmente criada dentro do nova, mas foi separada para um serviço a parte. É um serviço bem dinâmico, com capacidade de criação de classes de recursos. É um serviço simples comparado com os demais que abrangem o OpenStack, e de simples instalação e manuseio.

##### *Pré-requisitos*

Primeiramente acesse o MySQL CLI com a senha cadastrada via `mysql_secure_installation`:

```bash
mysql -u root -p
```

Crie um banco de dados para o placement, e também garanta todos os privilégios deste banco para o usuário placement, o valor PLACEMENT_DBPASS é a senha a ser utilizada na conexão pelo usuário placement:

```mariadb
MariaDB [(none)]> CREATE DATABASE placement;
MariaDB [(none)]> GRANT ALL PRIVILEGES ON placement.* TO 'placement'@'localhost' \
  IDENTIFIED BY 'PLACEMENT_DBPASS';
MariaDB [(none)]> GRANT ALL PRIVILEGES ON placement.* TO 'placement'@'%' \
  IDENTIFIED BY 'PLACEMENT_DBPASS';
```

Execute o **". adminrc"** para adentrar no usuário admin, após isso crie o user placement e substitua a senha *PLACEMENT_PASS* (Anote a senha, ela será utilizada nas configurações), também adicione o role admin ao placement:

```bash
$ openstack user create --domain default --password PLACEMENT_PASS placement
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
| enabled             | True                             |
...

$ openstack role add --project service --user placement admin
```

Crie o placement service:

```bash
openstack service create --name placement --description "Placement API" placement

+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | Placement API                    |
...
```

Crie os endpoints para o placement:

```bash
$ openstack endpoint create --region RegionOne placement public http://openstack:8778

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne placement internal http://openstack:8778

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne placement admin http://openstack:8778

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...
```

##### *Instalação e configuração*

Instale os pacotes do placement:

```bash
dnf install openstack-placement-api python3-osc-placement 
```

Configure o placement editando o arquivo de configuração **/etc/placement/placement.conf**:

```properties
# Documentação deste arquivo config:
# https://docs.openstack.org/placement/wallaby/configuration/config.html

[api]
# Meio de autenticação
auth_strategy = keystone

[keystone_authtoken]
# Configurações de autenticação do serviço no keystone. Altere PLACEMENT_PASS
auth_url = http://openstack:5000/v3
memcached_servers = openstack:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = placement
password = PLACEMENT_PASS


[oslo_policy]
#Trocar o policy.json para policy.yaml, pois o formato JSON está ficando deprecad para policy.
policy_file = policy.yaml

# Por que não [database] ? ...
[placement_database]
# connection é a conexão com o mysql via SQLAlchemy, altere o PLACEMENT_DBPASS.
connection = mysql+pymysql://placement:PLACEMENT_DBPASS@openstack/placement
```

Também é necessário modificar o arquivo de configuração do placement no Apache, localizado em **/etc/httpd/conf.d/00-placement-api.conf**, adicione ao final do arquivo as seguintes configurações:

```html
<Directory /usr/bin>
  <IfVersion >= 2.4>
    Require all granted
  </IfVersion>
  <IfVersion < 2.4>
    Order allow,deny
    Allow from all
  </IfVersion>
</Directory>
```

###### ***Notas:***

*Eu perdi um tempo tentando resolver o erro "Error (Expecting value: line 1 column 1 (char 0))" que a ausência desta configuração causava, algo que não está na documentação e que pode dar uma dor de cabeça para um iniciante.*

Após isto, execute o seguinte comando para estruturar o banco de dados do placement:

```bash
sudo su -s /bin/sh -c "placement-manage db sync" placement
```

E finalize a instalação reiniciando o serviço do Apache, também se certifique-se do funcionamento do mesmo:

```bash
systemctl restart httpd
systemctl status httpd
```

Para testar o funcionamento do placement, vamos executar alguns comandos, primeiro vamos checar o status do placement com o comando placement-status, não se esqueça de executar **". adminrc"**:

```bash
sudo placement-status upgrade check

+-------------------------------------------+
| Upgrade Check Results                     |
+-------------------------------------------+
| Check: Missing Root Provider IDs          |
| Result: Success                           |
| Details: None                             |
+-------------------------------------------+
| Check: Incomplete Consumers               |
| Result: Success                           |
| Details: None                             |
+-------------------------------------------+
| Check: Policy File JSON to YAML Migration |
| Result: Success                           |
| Details: None                             |
+-------------------------------------------+
```

E depois execute um comando no OpenStack-CLI para listar os recursos cadastrados que podem ser aplicados aos nós de computação:

```bash
openstack resource class list
+----------------------------+
| name                       |
+----------------------------+
| VCPU                       |
| MEMORY_MB                  |
| DISK_GB                    |
...
```

## Nova

###### [A instalação é diferente da documentação](https://docs.openstack.org/nova/latest/install/controller-install-obs.html)

Este é o serviço de compute, aonde irá fazer a virtualização, deploy, management das instâncias, comunicação com os storages, entre outras diversas funções. Composto por quatro partes, o nova-compute, nova-scheduler, nova-conductor e o nova-api. Cada parte tem uma função que compõe a arquitetura do nova, nova-scheduler: decide qual host obtém cada instância, nova-compute: manuseia a comunicação do hypervisor com as instancias, nova-conductor: lida com solicitações de *build* e *resize*, atua com o banco de dados ou lida com conversões de objetos. nova-api: interpreta as requisições via REST API e as converte para as funções do nova.

<img src="https://docs.openstack.org/nova/latest/_images/architecture.svg" alt="../_images/architecture.svg" style="zoom: 50%;" />

##### *Pré-requisitos*

Primeiramente acesse o MySQL CLI com a senha cadastrada via `mysql_secure_installation`:

```bash
mysql -u root -p
```

Crie três banco de dados para o NOVA, o nova_api, nova_cell0, e o nova:

```mariadb
MariaDB [(none)]> CREATE DATABASE nova_api;
MariaDB [(none)]> CREATE DATABASE nova;
MariaDB [(none)]> CREATE DATABASE nova_cell0;
```

E também garanta todos os privilégios destes bancos para o usuário nova, o valor NOVA_DBPASS é a senha a ser utilizada na conexão pelo usuário:

```mariadb
MariaDB [(none)]> GRANT ALL PRIVILEGES ON nova_api.* TO 'nova'@'localhost' \
  IDENTIFIED BY 'NOVA_DBPASS';
MariaDB [(none)]> GRANT ALL PRIVILEGES ON nova_api.* TO 'nova'@'%' \
  IDENTIFIED BY 'NOVA_DBPASS';

MariaDB [(none)]> GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'localhost' \
  IDENTIFIED BY 'NOVA_DBPASS';
MariaDB [(none)]> GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'%' \
  IDENTIFIED BY 'NOVA_DBPASS';

MariaDB [(none)]> GRANT ALL PRIVILEGES ON nova_cell0.* TO 'nova'@'localhost' \
  IDENTIFIED BY 'NOVA_DBPASS';
MariaDB [(none)]> GRANT ALL PRIVILEGES ON nova_cell0.* TO 'nova'@'%' \
  IDENTIFIED BY 'NOVA_DBPASS';
```

Execute o **". adminrc"** para adentrar no usuário admin, após isso crie o user nova e substitua a senha *NOVA_PASS* (Anote a senha, ela será utilizada nas configurações), também adicione o *role admin* ao nova:

```bash
$ openstack user create --domain default --password NOVA_PASS nova
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
| enabled             | True                             |
...

$ openstack role add --project service --user nova admin
```

Crie o nova service:

```bash
openstack service create --name nova --description "OpenStack Compute" compute

+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | OpenStack Compute                |
...
```

Crie os endpoints para o nova:

```bash
$ openstack endpoint create --region RegionOne nova public http://openstack:8774/v2.1

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne nova internal http://openstack:8774/v2.1

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne nova admin http://openstack:8774/v2.1

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...
```

##### *Instalação e configuração*

Instale os pacotes do nova-api, nova-conductor, nova-nonvcproxym, nova-compute e o nova-scheduler:

```bash
dnf install openstack-nova-api openstack-nova-conductor openstack-nova-novncproxy openstack-nova-scheduler openstack-nova-compute
```

Após isto, vamos fazer a extensa configuração do arquivo **/etc/nova/nova.conf**, ela consiste em colocar as configurações do **controller** e do **compute** em um único host, então se você está seguindo a Documentação, é necessário juntar as configurações no mesmo arquivo *(Neste projeto All-In-One)*:

```properties
# Documentação deste arquivo config:
# https://docs.openstack.org/nova/wallaby/configuration/config.html

[DEFAULT]
# Variável do seu IP, esse campo precisa ser criado.
my_ip = 192.168.15.15
enabled_apis = osapi_compute,metadata
# Conexão com o mensageiro rabbitMq
transport_url = rabbit://openstack:RABBIT_PASS@openstack:5672/
# Permitir fazer resize no mesmo host
allow_resize_to_same_host = True

[api]
# Meio de authenticação
auth_strategy = keystone

[api_database]
# connection é a conexão com o mysql via SQLAlchemy, altere o NOVA_DBPASS.
connection = mysql+pymysql://nova:NOVA_DBPASS@openstack/nova_api

[database]
# connection é a conexão com o mysql via SQLAlchemy, altere o NOVA_DBPASS.
connection = mysql+pymysql://nova:NOVA_DBPASS@openstack/nova

[glance]
# Configuração de conexão com o glance
api_servers = http://openstack:9292

[keystone_authtoken]
# Configurações de autenticação do serviço no keystone. Altere NOVA_DBPASS
www_authenticate_uri  = http://openstack:5000
auth_url = http://openstack:5000
memcached_servers = openstack:11211
auth_type = password
project_domain_name = Default
user_domain_name = Default
project_name = service
username = nova
password = NOVA_PASS

[libvirt]
# Método de virtualização utilizado
virt_type = kvm

[neutron]
# Este bloco vai ser configurado após a instalação do neutron.

[oslo_concurrency]
lock_path = /var/lib/nova/tmp

[placement]
# Configurações de autenticação do serviço placement. Altere PLACEMENT_PASS
region_name = RegionOne
project_domain_name = Default
project_name = service
auth_type = password
user_domain_name = Default
auth_url = http://openstack:5000/v3
username = placement
password = PLACEMENT_PASS

[vnc]
# Virtual Network Computer é o que irá providenciar o link do console web para mexer na instância. 
enabled = true
server_listen = $my_ip
server_proxyclient_address = $my_ip
novncproxy_base_url = http://openstack:6080/vnc_auto.html
```

Após isto, execute o seguinte comando para estruturar o banco de dados do **nova-api**:

```bash
sudo su -s /bin/sh -c "nova-manage api_db sync" nova
```

Agora, iremos mapear o banco de dados **cell0**:

```bash
sudo su -s /bin/sh -c "nova-manage cell_v2 map_cell0" nova
```

Também iremos criar a célula **cell1**:

```bash
sudo su -s /bin/sh -c "nova-manage cell_v2 create_cell --name=cell1" nova
```

Após isto, execute o seguinte comando para estruturar o banco de dados do **nova**:

```bash
sudo su -s /bin/sh -c "nova-manage db sync" nova
```

Vamos verificar se os bancos de dados foram mapeados e sincronizados com as configurações aplicadas:

```bash
sudo su -s /bin/sh -c "nova-manage cell_v2 list_cells" nova
+-------+--------+---------------------+--------------------------+
|  Name |  UUID  |     Transport URL   |    Database Connection   |
+-------+--------+---------------------+--------------------------+
| cell0 | 000... |        none:/       | ...@openstack/nova_cell0 |
| cell1 | ...... | ...@openstack:5672/ |    ...@openstack/nova    |
+-------+--------+---------------------+--------------------------+
```

Eu resumi o response do comando, mas o importante é verificar se está igual a este, na documentação mostra o  campo *"Database Connection"* do **cell1** com o final **"/nova_cell1"** mas na verdade, é só **"/nova"**, o campo *"Transport URL"* também é diferente da Documentação, mostra apenas **"/"**. o **UUID** do **cell0** é diversos zeros.

Depois da verificação, iremos ativar os diversos serviços que fazem parte do nova:

```bash
systemctl enable libvirtd openstack-nova-compute \
	openstack-nova-api openstack-nova-scheduler \
	openstack-nova-conductor openstack-nova-novncproxy
```

Também, verifique se os mesmos estão funcionando:

```bash
systemctl status libvirtd openstack-nova-compute \
	openstack-nova-api openstack-nova-scheduler \
	openstack-nova-conductor openstack-nova-novncproxy
```

Se tudo estiver rodando da maneira correta, o nova conseguirá mapear as cell's, recomendo também, antes de executar o mapeamento, verificar se todos os serviços do sistema estão rodando da maneira correta, com um `systemctl`. Vamos mapear executando o seguinte comando:

```bash
sudo su -s /bin/sh -c "nova-manage cell_v2 discover_hosts --verbose" nova

# Verifique o response do comando, certifique-se de que ele encontrou uma celular não mapeada. "Found 1 unmapped computes in cell: ..."
```

Execute também o seguinte comando para listar os hosts, caso tenha funcionado a instalação, configuração e o mapeamento ele irá retornar o ID do host mapeado:

```bash
sudo nova-manage cell_v2 list_hosts
+-----------+--------------------------------------+-----------+
| Cell Name |              Cell UUID               |  Hostname |
+-----------+--------------------------------------+-----------+
|   cell1   | 5d7bec48-d704-4ef8-810a-b856af7d033b | openstack |
+-----------+--------------------------------------+-----------+
```

Também execute um **"nova-status upgrade check"**, verifique se todos os campos estão *Success* *(Pode apresentar mensagens deprecad)*:

```
nova-status upgrade check
+-----------------------------------+
| Upgrade Check Results             |
+-----------------------------------+
| Check: Cells v2                   |
| Result: Success                   |
...
```

###### ***Notas*:**

*Relembre-se de que ainda não configuramos o bloco do neutron dentro das configurações do nova.conf. Mas a configuração é bem simples, é apenas de conexão com o neutron, e nada mais. Também se certifique-se de que não apresenta nenhum erro nos logs /var/log/nova/\*.log*

## Neutron

###### [A instalação é diferente da documentação](https://docs.openstack.org/neutron/wallaby/install/controller-install-rdo.html)

O serviço de redes do OpenStack, foi para mim o mais complexo de se lidar, é o modulo que faz o gerenciamento das redes, *switchs, routers, lans, vlans e outros*. Ela faz a criação e gestão deste setor dentro do OpenStack, é dividida em duas partes, o neutron controlador e o neutron que fica dentro do compute. O Neutron controlador é o que irá coordenar e organizar as redes como um conjunto, e o neutron que fica dentro dos nós do compute, é o que irá orquestrar de fato o funcionamento dentro das virtualizações e se comunicar com o controlador. 

<img src="https://docs.openstack.org/security-guide/_images/sdn-connections.png" alt="https://docs.openstack.org/security-guide/_images/sdn-connections.png" style="zoom:80%;" />

##### *Pré-requisitos*

Primeiramente acesse o MySQL CLI com a senha cadastrada via `mysql_secure_installation`:

```bash
mysql -u root -p
```

Crie um banco de dados para o neutron:

```mariadb
MariaDB [(none)] CREATE DATABASE neutron;
```

E também garanta todos os privilégios destes bancos para o usuário neutron, o valor NEUTRON_DBPASS é a senha a ser utilizada na conexão pelo usuário:

```mariadb
MariaDB [(none)]> GRANT ALL PRIVILEGES ON neutron.* TO 'neutron'@'localhost' \
  IDENTIFIED BY 'NEUTRON_DBPASS';
MariaDB [(none)]> GRANT ALL PRIVILEGES ON neutron.* TO 'neutron'@'%' \
  IDENTIFIED BY 'NEUTRON_DBPASS';
```

Execute o **". adminrc"** para adentrar no usuário admin, após isso crie o user neutron e substitua a senha *NEUTRON_PASS* (Anote a senha, ela será utilizada nas configurações), também adicione o *role admin* ao neutron:

```bash
$ openstack user create --domain default --password NEUTRON_PASS neutron
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
| enabled             | True                             |
...

$ openstack role add --project service --user neutron admin
```

Crie o nova service:

```bash
openstack service create --name neutron --description "OpenStack Networking" network

+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | OpenStack Networking             |
...
```

Crie os endpoints para o neutron:

```bash
$ openstack endpoint create --region RegionOne neutron public http://openstack:9696

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne neutron internal http://openstack:9696

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...

$ openstack endpoint create --region RegionOne neutron admin http://openstack:9696

+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
...
```

##### *Instalação e configuração*

Como descrito no artigo, estarei fazendo o deploy do OpenStack com apenas uma NIC(Adaptador de Rede), utilizando a estrutura de Bridge, então os IP's da instancias estarão na nossa LAN 192.168.15.0/24, e cada instancia terá um IP próprio dentro da Pool de IP's do nosso roteador. Acompanhe também a [documentação](https://docs.openstack.org/neutron/wallaby/admin/deploy-ovs-provider.html) desta estrutura.

<img src="https://docs.openstack.org/neutron/wallaby/_images/deploy-ovs-provider-overview.png" alt="Provider networks using OVS - overview" style="zoom: 80%;" />

Primeiramente iremos instalar os pacotes do neutron:

```bash
dnf install openstack-neutron openstack-neutron-ml2 openstack-neutron-openvswitch \
	ebtables 
```

Após isto, vamos fazer a configuração do arquivo **/etc/neutron/neutron.conf**, ela consiste em colocar as configurações de **comunicação**, as configurações da rede são feitas pelos arquivos dos agentes:

```properties
# Documentação deste arquivo config:
# https://docs.openstack.org/neutron/wallaby/configuration/neutron.html

[DEFAULT]
# Conexão com o mensageiro rabbitMq
transport_url = rabbit://openstack:RABBIT_PASS@controller
# O main-plugin da rede
core_plugin = ml2
# Deixar nulo para desativar os plugins de service.
service_plugins =
# Agentes de DHCP por rede.
dhcp_agents_per_network = 1
# Meio de authenticação
auth_strategy = keystone
# Sistemas de notificação
notify_nova_on_port_status_changes = true
notify_nova_on_port_data_changes = true
# O host do metadata e a senha, explicarem na parte do metadata.
# Substitua a senha METADATA_SECRET.
nova_metadata_host = openstack
metadata_proxy_shared_secret = METADATA_SECRET

[nova]
# Configurações de conexão com o nova.
auth_url = http://openstack:5000
auth_type = password
project_domain_name = default
user_domain_name = default
region_name = RegionOne
project_name = service
username = nova
password = NOVA_PASS

[database]
# connection é a conexão com o mysql via SQLAlchemy, altere o NEUTRON_DBPASS.
connection = mysql+pymysql://neutron:NEUTRON_DBPASS@openstack/neutron

[keystone_authtoken]
# Configurações de autenticação do serviço no keystone. Altere NEUTRON_DBPASS.
www_authenticate_uri = http://openstack:5000
auth_url = http://openstack:5000
memcached_servers = openstack:11211
auth_type = password
project_domain_name = default
user_domain_name = default
project_name = service
username = neutron
password = NEUTRON_PASS

[oslo_concurrency]
# Diretório a ser usado para arquivos de bloqueio
lock_path = /var/lib/neutron/tmp
```

Agora, iremos configurar os agentes e os plugins do neutron, primeiro iremos configurar o **ml2** pelo arquivo **/etc/neutron/plugins/ml2/ml2_conf.ini**:

```properties
[ml2]
#Drivers de funcionamento da rede, baseado na estrutura do projeto. flat e vlan.
type_drivers = flat,vlan
# Deixar em branco poís a arquitetura do projeto não suporte self-service network.
# Mais informações: https://docs.openstack.org/install-guide/launch-instance-networks-selfservice.html
tenant_network_types =
# Openvswitch como mecanismo de bridge
mechanism_drivers = openvswitch
extension_drivers = port_security

[ml2_type_flat]
flat_networks = provider

[ml2_type_vlan]
network_vlan_ranges = provider
```

Também é necessário configurar os agentes, primeiro o **openvswitch_agent.ini** localizado em **/etc/neutron/plugins/ml2/**:

```properties
[ovs]
# Iremos colocar a interface de bridge que iremos criar futuramente, br-ex neste projeto.
bridge_mappings = provider:br-ex

[securitygroup]
# O método para fazer a gestão dos grupos de segurança das instâncias. 
firewall_driver = iptables_hybrid
```

Agora, o **dhcp_agent.ini** localizado em **/etc/neutron/**:

```properties
[DEFAULT]
interface_driver = openvswitch
enable_isolated_metadata = True
force_metadata = True
```

Por ultimo, o **metadata_agent.ini** localizado em **/etc/neutron/**:

```properties
[DEFAULT]
# Nosso host:
nova_metadata_host = openstack
# A senha inserida no neutron.conf, utilizada também aqui:
metadata_proxy_shared_secret = METADATA_SECRET
```

Após as configurações, iremos aplicar os seguintes comandos para estruturar o banco de dados do neutron:

```bash
sudo su -s /bin/sh -c "neutron-db-manage --config-file /etc/neutron/neutron.conf \
  --config-file /etc/neutron/plugins/ml2/ml2_conf.ini upgrade head" neutron
```

Também é necessário adicionarmos o bloco de configuração **[neutron]** no **nova**, pelo arquivo **/etc/nova/nova.conf**:

```properties
#Realizar as configurações no nova, para fazer a comunicação com o neutron.

[neutron]
auth_url = http://openstack:5000
auth_type = password
project_domain_name = default
user_domain_name = default
region_name = RegionOne
project_name = service
username = neutron
password = NEUTRON_PASS
service_metadata_proxy = true
metadata_proxy_shared_secret = METADATA_SECRET
```

##### *Finalização*

Precisamos configurar o bridge pelo **OpenvSwitch**, faça os passos da maneira correta para não perdemos a conexão com o nosso Host, verifique bem as informações antes de adicionar a port do Bridge. Primeiro, configure os arquivos **/etc/sysconfig/network-scripts/ifcfg-br-ex** com os dados da sua interface de rede **ifcfg-XXX** *(Recomendo fazer um backup do arquivo ifcfg-XXX da sua interface, no meu caso, ifcfg-enp5s0)*. Configurações do **ifcfg-br-ex**: 

```properties
TYPE=Ethernet
BOOTPROTO=none
DEFROUTE=yes
IPADDR=192.168.15.15
NETMASK=255.255.255.0
GATEWAY=192.168.15.1
DEVICE=br-ex
NAME=br-ex
NM_CONTROLLED=no
PEERDNS=no
ONBOOT=yes
```

Configurações do **ifcfg-enp5s0** *(Lembrando que sua interface pode ter outro nome, geralmente eth0)*:

```properties
TYPE=OVSPort
DEVICETYPE=ovs
OVS_BRIDGE=br-ex
DEVICE=enp5s0
ONBOOT=yes
```

Após, iremos criar o bridge pelo **openvswitch**, lembrando que você perdera a conexão momentaneamente:

```bash
$ ovs-vsctl add-br br-ex
$ ovs-vsctl add-port br-ex enp5s0; sudo systemctl restart network #Lembrando de mudar o enp5s0 pelo nome da sua interface.
```

Iremos ativar também os serviços do neutron, e reiniciar o nova-compute:

```bash
$ systemctl enable neutron-server neutron-dhcp-agent neutron-metadata-agent
$ systemctl start neutron-server neutron-dhcp-agent neutron-metadata-agent
$ systemctl restart openstack-nova-compute
```

Para verificar o funcionamento, liste os agentes do neutron, verifique se todos estão no State **UP** e **Alive**:

```bash
openstack network agent list
+----+--------------------+-----------+-------+-------+---------------------------+
| ID | Agent Type         | Host      | Alive | State | Binary                    |
+----+--------------------+-----------+-------+-------+---------------------------+
| ZZ | Open vSwitch agent | openstack | :-)   | UP    | neutron-openvswitch-agent |
| YY | DHCP agent         | openstack | :-)   | UP    | neutron-dhcp-agent        |
| XX | Metadata agent     | openstack | :-)   | UP    | neutron-metadata-agent    |
+----+--------------------+-----------+-------+-------+---------------------------+
```

## Deploy da instância

###### [O funcionamento é diferente da documentação](https://docs.openstack.org/install-guide/launch-instance.html)

Depois de todas as instalações e configurações, iremos fazer o deploy da instancia, de fato colocar tudo em funcionamento. Antes de começar o deploy, recomendo verificar o funcionamento de todos os componentes, verificar se os serviços estão funcionando corretamente, para depois tentar o Deploy. Já aviso antecipadamente, se caso der erro no deploy, verifique os LOGS! Principalmente o do nova *(/var/log/nova/...)* e o do neutron *(/var/log/neutron/server.log)*. Primeiro passo é a criação da rede:

```bash
openstack network create --share --provider-physical-network provider --provider-network-type flat RedePrincipal
```

E crie a sub-rede, lembrando de utilizar o seu IP, seu gateway, o DNS *(Estou utilizando o 8.8.4.4)*, e escolher a pool de IP's *(Estou utilizando de 192.168.15.200 - 192.168.15.250)*:

```bash
openstack subnet create --subnet-range 192.168.15.0/24 --gateway 192.168.15.1 --network RedePrincipal --allocation-pool start=192.168.15.200,end=192.168.15.250 --dns-nameserver 8.8.4.4 SubRede
```

Crie um grupo de segurança com as regras para acesso SSH e também para pacotes ICMP :

```bash
$ openstack security group create MinhasRegras
$ openstack security group rule create --proto icmp MinhasRegras
$ openstack security group rule create --proto tcp --dst-port 22 MinhasRegras
```

Crie agora um flavor para colocar na instância, meu flavor terá 128MB de RAM, 1 vCPU e 2 GB de Disco. Denominarei o flavor pelo nome m1.nano com o ID 0:

```bash
openstack flavor create flavor.1vcpu.128m.2g --id 0 --ram 128 --disk 2 --vcpus 1
```

Também iremos criar a key-pair para fazer a conexão SSH *(É necessário ter gerado a chave SSH previamente. com o ssh-keygen)*:

```bash
openstack keypair create --public-key ~/.ssh/id_rsa.pub ChaveSSH
```

E por fim, criar o servidor com o nome **InstanciaCirrOS**:

```bash
openstack server create --flavor 0 --image "CirrOS 0.5.0 x86_64" --nic net-id=RedePrincipal InstanciaCirrOS --key-name ChaveSSH
```

Vamos verificar se está ativo com o comando **"openstack server list"**:

```
openstack server list
+----+-----------------+--------+------------------------------+
| ID | Name            | Status | Networks                     |
+----+-----------------+--------+------------------------------+
| XX | InstanciaCirrOS | ACTIVE | RedePrincipal=192.168.15.233 |
+----+-----------------+--------+------------------------------+
+---------------------+----------------------+
| Image               | Flavor               |
|---------------------+----------------------+
| CirrOS 0.5.0 x86_64 | flavor.1vcpu.100m.2g |
+---------------------+----------------------+
```

Agora, podemos conectar via VNC e acessar o link:

```bash
openstack console url show InstanciaCirrOS
http://openstack:6080/vnc_auto...
```

Ou via SSH com o IP mostrado no comando "server list":

```bash
ssh cirros@192.168.15.233
$
```



## Fim

Bom, neste artigo tratei esta instalação do OpenStack comando por comando, linha por linha. Foi uma escrita extensa mas de alta recomendação para quem está começando, assim como eu. A documentação de cara pode ser complicada, ainda mais por parte do Neutron/Redes.

Ainda pretendo abordar outros componentes e estruturas do OpenStack, estou montando mais uma maquina para montar um cluster e uma arquitetura mais *enterprise* e complexa. 

Espero que tenham gostado. Qualquer sugestão é bem vinda.

### Contatos:

### *[Github](https://github.com/le0nard01) | [Linkedin](https://www.linkedin.com/in/leonardooste/) | [Telegram](https://t.me/le0nard01)*