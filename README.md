# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# dep

-signup on aws
-launch instance
...missed few steps like setuping up the machine etc add seceret key etc

- go to connect intance -> ssh
- open your terminal
- locate to download folder ie cd download note doanlowd is a folder where my pem file is present

- do chmod 400 "secrt key .pem" (doing ch mod to chnage the permission)
- do ssh i "pemfile" "machine"
  to connnet with ur mahcine once u do this u are in our machine not local its your aws machine if u leave it as it is it will automcatially stop and suspned
  eg -> when u buy new laptop u have to setup it right same way u have to setup ur aws remote machine so that it will run ur code or app

- as its a FE project so will need node for the same rigt?
- for eg node to install -> install that version which ur proj is running otherwie it will fail

-now we dont have the project on remote machine so we need it to clone it from git right ?

need to do npm install and then npm run build to build the app and generate dist project

- to dpely fe proj we need something callled nginx its its new free and open source software its kindof web server will use this to host our fe porject

sudo apt update
sudo apt install nginx

will use the nginx server to deploy our fe project on to it first need to start it

sudo systemctl start nginx
sudo systemctl enable nginx

- now wil copy the code from dist folder ie build files to nginx http server and it is located in path /var/www/html

- scp (copy command) -r (recursive ness ie all the files) dist/_ (copy all the files from dist/_ to ) /var/www/html/

after doing this all the files from dist will be copied inside var ww html path of nginx (nginx is ntg but it a open s which gives u an http server)

scp -r dist/\* /var/www/html

above cmd will giev u permission erro so use sudo

sudo scp -r dist/\* /var/www/html

go to Public IPv4 address in aws instance -> but it will not runn why? coz aws blocks all ur ports nginx deploys on 80 so u have to enable post 80 on ur instance
-> go to insytnace - securty rules-> inbound rueles -> edit-> add a rule port 80 and source 0000/0 to allow access from all over internet

-> as ur frontend will start running on the ipv4 ip now u can map any domain to this ip eg namaste dev .com etc okay

# deplopying backend
