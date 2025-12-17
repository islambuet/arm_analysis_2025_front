<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}( {{item.name}} )
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <form id="formSaveItem">
        <input type="hidden" name="save_token" id="save_token" :value="new Date().getTime()">
        <input type="hidden" name="id" :value="item.id">
        <table style="width: 1500px;" class="table table-bordered sticky">
          <thead class="table-active">
          <tr>
            <th style="width: 150px;">{{labels.get('label_crop_name')}}</th>
            <th style="width: 200px;">{{labels.get('label_crop_type_name')}}</th>
            <th style="width: 100px;">Total Market Size</th>
            <th style="width: 200px;">Pocket Market</th>
            <th style="">Competitors Variety</th>
          </tr>
          </thead>
          <tbody class="table-striped table-hover">
          <tr class="row_type" v-for="row in item.rows" :key="'row_'+row.id" :id="'type_'+row.id">
            <td class="col_crop_name">{{row.crop_name}}</td>
            <td class="col_crop_type_name">{{row.crop_type_name}}</td>
            <td class="col_market_size_total"><input type="text" :name="'items['+row.id+'][market_size_total]'" class="form-control float_positive" :value="item.data[row.id]?item.data[row.id]['market_size_total']:''"></td>
            <td class="col_pocket_market"><input type="text" :name="'items['+row.id+'][pocket_market]'" class="form-control" :value="item.data[row.id]?item.data[row.id]['pocket_market']:''"></td>
            <td class="col_competitors_info">
              <table class="table table-bordered">
                <thead>
                <tr>
                  <th style="width: 150px">Company</th>
                  <th style="width: 150px">Variety</th>
                  <th>Why Recommended</th>
                  <th style="width: 110px"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-if="item.data[row.id]" v-for="(competitor_varieties_info,variety_id) in item.data[row.id]['competitor_varieties']">
                  <td>{{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][variety_id])?taskData.varieties_competitor_typewise[row.id][variety_id]['competitor_name']:"Other" }}</td>
                  <td>{{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][variety_id])?taskData.varieties_competitor_typewise[row.id][variety_id]['name']:"Other" }}</td>
                  <td><input type="text" :name="'items['+row.id+'][competitor_varieties]['+variety_id+'][recommended_reason]'" class="form-control input_competitor_recommended_reason" :value="item.data[row.id]['competitor_varieties'][variety_id]?item.data[row.id]['competitor_varieties'][variety_id]['recommended_reason']:''" /></td>
                  <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor"><i class="bi bi-dash-circle"></i> Remove </button></td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div class="input-group" >
                      <select class="form-control sel_competitor_variety">
                        <option v-if="taskData.varieties_competitor_typewise_ordered[row.id]" v-for="variety in taskData.varieties_competitor_typewise_ordered[row.id]" :value="variety.id">
                          {{variety.competitor_name+'-'+ variety.name}}
                        </option>
                        <option value="0">Other</option>
                      </select>
                    </div>
                  </td>
                  <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_competitor_size"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
          </tbody>
        </table>
      </form>
    </div>
  </div>
</template>
<script setup>


  import toastFunctions from "@/assets/toastFunctions";
  import labels from '@/labels'
  
  import {useRouter} from "vue-router";
  import {inject, reactive} from "vue";
  import axios from "axios";
  import DetailTemplate from '@/components/DetailTemplate.vue';
  import {useRoute} from "vue-router/dist/vue-router";
  import systemFunctions from "@/assets/systemFunctions";


  const route =useRoute()
  const router =useRouter()
  let taskData = inject('taskData')
  let item=reactive({
    id:0,
    exists:false,
    detailFields:{},
    data:{
      varieties:{}
    },
  })
  const getItem=async ()=>{
    await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
      if (res.data.error == "") {
        item.data=res.data.data;
        let rows=[];
        for(let i=0;i<taskData.crop_types.length;i++){
          let crop_type=taskData.crop_types[i];
          let row={};
          row['id']=crop_type['id'];
          row['crop_name']=crop_type['crop_name'];
          row['crop_type_name']=crop_type['name'];
          rows.push(row);
        }
        item.rows=rows;
        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  item.id=route.params['item_id']?route.params['item_id']:'';
  if(item.id){
    if(!(taskData.permissions.action_0)){
      toastFunctions.showAccessDenyMessage();
    }
    else{
      let name=item.id.substring(0,4)+' -- '
      let season_id=item.id.substring(5,item.id.lastIndexOf('_'));
      for(let i=0;i<taskData.seasons.length;i++){
        if(taskData.seasons[i].id==season_id){
          name+=taskData.seasons[i].name;
        }
      }
      name+=' -- '
      let territory_id=item.id.substring(item.id.lastIndexOf('_')+1);
      for(let i=0;i<taskData.location_territories.length;i++){
        if(taskData.location_territories[i].id==territory_id){
          name+=taskData.location_territories[i].name;
        }
      }
      item.name=name;
      getItem();
    }
  }
  else{
    toastFunctions.showAccessDenyMessage();
  }

</script>