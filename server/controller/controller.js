import express from 'express';
const app = express.Router();
app.use(express.json());
const repo = []
const allTypeErrors = {}
app.post('/addOrder', async (req, res) => {
    try{
        const order = req.body;
        if(!order.status && !order.numberOfOrder && !order.date && !order.typeError && !order.status){
            throw new Error('Не заполнено какое либо поле')
        }
        if(repo.find(elem=>elem.numberOfOrder === order.numberOfOrder)){
            throw new Error('Заказ с таким ID уже есть')
        }
        if((order.status.toLowerCase() !== 'в ожидании') && (order.status.toLowerCase() !== 'в работе')){
            throw new Error('Неверный статус заявки')
        }
        allTypeErrors[order.typeError] === undefined ? allTypeErrors[order.typeError] = 1 : allTypeErrors[order.typeError] +=1
        const normalOrder = {
            numberOfOrder: Number(order.numberOfOrder),
            addDate: new Date(order.addDate),
            instruments: order.instruments,
            typeError: order.typeError,
            description: order.description || 'Отсутсвует',
            client: order.client || 'Не указан',
            status: order.status,
            master: order.master || 'Не назначен',
        }
        repo.push(normalOrder)
        res.status(200).send('Заявка создана успешно')
    }catch(err){
        res.status(400).send(`Bad request ${err}`)
    }
})

app.get("/getAllOrders", async (req, res) => {
    try{
        res.status(200).send(repo)
    }catch(err){
        res.status(400).send('Bad request')
    }
})

app.put("/updateOrder/:numberOfOrder", async (req, res) => {
    try{
        const order = req.body;
        const indexOrderInRepo = repo.findIndex(elem=>elem.numberOfOrder === Number(req.params.numberOfOrder));
        console.log(indexOrderInRepo)
        if(indexOrderInRepo === -1){
            throw new Error('Не найдена заявка');
        }
        repo[indexOrderInRepo] = {
            ...repo[indexOrderInRepo],
            ...order,
            status: (() => {
                if(order.status){
                    if(order.status.toLowerCase() === 'готов'){
                        return repo[indexOrderInRepo].status = 'готов'
                    }else if (['в ожидании','в работе'].includes(order.status.toLowerCase())){
                        return order.status
                    }else{
                        throw new Error('Ошибка статуса!');
                    }
                }
            })(),
        }
        if(repo[indexOrderInRepo].status.toLowerCase() === 'готов'){
            repo[indexOrderInRepo].endDate = new Date();
            repo[indexOrderInRepo].averageTime = (repo[indexOrderInRepo].endDate - repo[indexOrderInRepo].addDate) / (1000);
        }
        res.status(200).send('Заявка была успешно изменена!')
    }catch(err){
        res.status(400).send(`Заявка не была изменена, ${err}`)
    }
})

app.put("/updateOrder/:numberOfOrder", async (req, res) => {
    try{
        const order = req.body;
        const indexOrderInRepo = repo.findIndex(elem=>elem.numberOfOrder === Number(req.params.numberOfOrder));
        console.log(indexOrderInRepo)
        if(indexOrderInRepo === -1){
            throw new Error('Не найдена заявка');
        }
        console.log('Тело:',order)
        repo[indexOrderInRepo] = {
            ...repo[indexOrderInRepo],
            ...order,
            status: (() => {
                if(order.status){
                    console.log('ДА1')
                    if(order.status.toLowerCase() === 'готов'){
                        console.log('ДА')
                        return repo[indexOrderInRepo].status = 'готов'
                    }else if (['в ожидании','в работе'].includes(order.status.toLowerCase())){
                        return order.status
                    }else{
                        throw new Error('Ошибка статуса!');
                    }
                }
            })(),
        }
        if(repo[indexOrderInRepo].status.toLowerCase() === 'готов'){
            repo[indexOrderInRepo].endDate = new Date();
            repo[indexOrderInRepo].averageTime = (repo[indexOrderInRepo].endDate - repo[indexOrderInRepo].addDate) / (1000);
            repo[indexOrderInRepo].notification = true;
        }
        res.status(200).send('Заявка была успешно изменена!')
    }catch(err){
        res.status(400).send(`Заявка не была изменена, ${err}`)
    }
})

app.get('/getStatic', async (req, res) => {
    try{
        let count = 0
        repo.filter(elem=>elem.averageTime).forEach(elem=>(
            count += elem.averageTime
        ))
        console.log('test',count)
        const statics = {
            countOfEndOrder: repo.filter(elem=>elem.status === 'готов').length,
            averageAllTime: count / repo.length,
            typeError: allTypeErrors
        }
        res.status(200).send(statics || 'Статистики еще нет!')
    }catch(err){
        res.status(400).send('Bad request')
    }
})
export default app;

