"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInterval, useSessionStorage, useWindowSize } from "usehooks-ts";
import { clone_object, random_float, random_int } from "@/app/utils/utils";
import { toast } from "react-toastify";
import { api_get_cpu_info, api_get_tong_quan_dien, api_get_tong_quan_nuoc } from "../api";
import { TYPE_CPU, TYPE_PRESSURE, TYPE_VOLTAGE,TYPE_PUMP,TYPE_TEMPER } from "../database";
// import ReactSpeedometer from "react-d3-speedometer";
import ReactECharts from "echarts-for-react";
import NextImage from "next/image";

const GaugeChartPressure = ({ value, min = 0, max = 3.5, min_set,max_set }: { value: number; min?: number; max?: number;min_set:number;max_set:number}) => {
    const highlightedValues = [
        [0, "#808080"],
        [Math.max((min_set - min) / (max - min), 0), "#808080"],
        [Math.max((min_set - min) / (max - min), 0), "#0ac507"],
        [Math.min((max_set - min) / (max - min), 1), "#0ac507"],
        [Math.min((max_set - min) / (max - min), 1), "#808080"],
        [1, "#808080"]
    ];
    const pointerColor = value < min_set || value > max_set ? "#ff2313" : "#0ac507";
    const option = {
        backgroundcolor: '#383749',
        series: [
          {
            type: 'gauge',
            min: min,
            max: max,
            splitNumber: 7,
            startAngle: 195, // Góc bắt đầu
            endAngle: -15,   // Góc kết thúc
            center: ["50%", "60%"], 
            axisLine: {
              lineStyle: {
                width: 30,
                color: highlightedValues
              }
            },
            pointer: {
              itemStyle: {
                color: pointerColor
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 1
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 3
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: -28,
              fontSize: 16,
              fontWeight: "bold",
              formatter: function (value: number) {
                return [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].includes(value) ? value.toFixed(1) : "";
              },
             },
            detail: {
              valueAnimation: true,
              formatter: (value: number) => `${value.toFixed(1)} Bar`,
              color: pointerColor,
              offsetCenter: [0, "60%"],
              fontSize: 18,
            },
            data: [{ value }],
          }
        ]
      };
    // return <ReactECharts option={option} style={{ height: "250px", width: "600px" }} />;
    return <ReactECharts option={option} style={{ width: "100%", aspectRatio: "700/250" ,maxHeight: "200px"}} />;
};

const GaugeChartVoltage = ({ value, min = 0, max = 500, alarm_set}: { value: number; min?: number; max?: number;alarm_set:number }) => {
    const startAngle = 220;
    const endAngle = -40;
    
    // Tính góc của pointer
    const angle = ((value - min) / (max - min)) * (startAngle - endAngle) + endAngle;
    const radians = (angle * Math.PI) / 180; // Chuyển đổi sang radian
    const radius = 1; // Tỷ lệ bán kính của gauge nhỏ
    const x = radius * Math.cos(radians);
    const y = radius * Math.sin(radians);
    const alarm_pos = alarm_set/max;

    const highlightedalarm = [
        [0, "#ff2313"], 
        [(alarm_pos), "#0ac507"],  // từ 0 tới vị trí alarrm màu xanh lá
        [1, "#ff2313"],           // còn lại màu đỏ
    ];
     // Xác định màu cho progress bar
    const progressColor =  value === 0 || value <= alarm_set ? "#0ac507" : "#ff2313";
    const option = {
        series: [
          {
            type: 'gauge',
            min: min,
            max: max,
            splitNumber: 10,
            startAngle: startAngle, // Góc bắt đầu
            endAngle: endAngle,   // Góc kết thúc
            center: ["50%", "60%"], 
            axisLine: {
              lineStyle: {
                width: 25,
                color: highlightedalarm
              }
            },
            pointer: {
            show: false,
            },
            axisTick: {
              distance: -25,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 1
              }
            },
            splitLine: {
              distance: -25,
              length: 10,
              lineStyle: {
                color: '#fff',
                width: 2
              }
            },
            axisLabel: {
                color: 'inherit',
                distance: -15,
                fontSize: 15,
                fontWeight: "bold",
                formatter: function (value: number) {
                    return [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].includes(value) ? value.toFixed(0) : "";
                },
               },
            detail: {
              valueAnimation: true,
              formatter: (value: number) => `${value.toFixed(1)} Vol`,
              color: 'inherit',
              offsetCenter: [0, "70%"],
              fontSize: 18,
              fontWeight: "bold",
            },
            data: [{ value }],
          },
         // Gauge nhỏ làm progress bar
         {
            type: "gauge",
            min: min,
            max: max,
            radius: "42%", // Nhỏ hơn gauge chính
            startAngle: startAngle, // Góc bắt đầu
            endAngle: endAngle,   // Góc kết thúc
            center: ["50%", "60%"], 
            progress: {
                show: true,
                width: 5,
                itemStyle: { color:  progressColor}, // Màu progress
            },
            axisLine: { show: false }, // Ẩn viền
            axisLabel: { show: false },
            splitLine: { show: false },
            axisTick: { show: false },
            detail: {show: false},
            // pointer: {
            //     show: false,
            // },
            pointer: {
                icon: 'path://M10,0 A10,10 0 1,1 -10,0 A10,10 0 1,1 10,0 Z',
                length: '40%',
                width: 17,
                offsetCenter: [0, '-75%'],
                itemStyle: { color:  progressColor}
              },
            data: [{ value }],
            
        },
            ],
      };
    return <ReactECharts option={option} style={{ height: "200px", width: "500px" }} />;
    // return <ReactECharts option={option} style={{ width: "100%", aspectRatio: "250 / 600" }} />;
};
const pressureLabels = [
    "Bồn nước nóng", 
    "Bồn tẩy dầu 01", 
    "Bồn tẩy dầu 02", 
    "Bồn nước rửa 01", 
    "Bồn nước rửa 02", 
    "Bồn định hình", 
    "Bồn phủ phốt phát", 
    "Bồn nước rửa 03", 
    "Bồn phút nhôm PALCOAT",
    "Bồn nước rửa 04", 
    "Bồn nước rửa 05", 
    "Bồn nước rửa 06", 
    "Bồn nước rửa UF 01", 
    "Bồn nước rửa UF 02", 
    "Bồn nước rửa UF 03"
    // "Bồn nước rửa UF 04"
];

const WidgetPressure = ({ data }: { data: TYPE_PRESSURE[] }) => {
    return (
        <div className="flex flex-col h-full w-full border-2 border-gray-500 pr-1 overflow-y-auto rounded-lg shadow-lg">
           <div className="flex items-end mb-4 mt-4 text-4xl text-[#0ac507] "
                style={{ textShadow: "0px 0px 10px #0ac507" }}>
                <NextImage src="/imgs/speedometer.png" alt="logo_vf" width={50} height={50} className="ml-2 mr-2" />
                 PRESSURE
            </div>
            <div className="flex-1 grid grid-rows-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
            {data.map((item, idx) => {
                    const pressure = item.pressure ?? 0;
                    const minPressure = item.min_pressure ?? 0;
                    const maxPressure = item.max_pressure ?? 0;
                    const isOutOfRange = pressure < minPressure || pressure > maxPressure;

                    return (
                        // <div key={idx} className={`flex flex-col items-center bg-[#1a192e] pt-1 rounded-lg shadow-lg p-2  w-full h-full border-2 border-b-4 ${isOutOfRange ? 'border-[#ff8635e7]' : 'border-[#0ac507]'}`}>
                        <div key={idx} className={`flex flex-col items-center bg-[#1a192e] pt-2 rounded-lg w-full border-1 border-b-4 ${isOutOfRange ?'border-[#ff6a13] shadow-[0_0_5px_#ff6a13]' : 'border-[#0ac507] shadow-[0_0_5px_#0ac507]'}`}> 
                        <GaugeChartPressure value={pressure} min_set={minPressure} max_set={maxPressure} />
                            <span className="text-white text-1x1 font-bold ml-4 w-full text-left">{pressureLabels[idx]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
const WidgetPump = ({ data }: { data: TYPE_PUMP[] }) => {
    const [pump1, setPump1] = useState(false);
    const [pump2, setPump2] = useState(false);

    return (
        <div className="flex flex-col w-full items-center p-2 border-2 border-gray-500 rounded-lg shadow-lg">
            <div className="flex items-end mb-4 mt-4 text-2xl text-[#ff2313] self-start" style={{ textShadow: "0px 0px 10px #ff2313" }}>
                <NextImage src="/imgs/pump_red.png" alt="logo_vf" width={30} height={30} className="mr-2" />
                      PUMP
            </div>
            <div className="flex gap-4 mt-2">
                <div className="flex flex-col items-center">
                    <button
                     className={`relative flex items-center px-40 py-2 transition-all duration-300 rounded-lg shadow-md 
                            ${pump1 ? 'bg-[#0ac507] hover:bg-[#45da42] text-2xl text-white justify-end' : 'bg-[#c5c5c5] hover:bg-gray-500 text-2xl text-[#868484] justify-start'}`}
                            onClick={() => setPump1(!pump1)}
                        // className={`relative flex px-40 py-2 transition-all duration-300 rounded-lg shadow-md ${pump1 ? ' bg-[#0ac507] hover:bg-[#45da42] text-2xl text-white justify-end' : 'bg-[#c5c5c5] hover:bg-gray-500 text-2xl text-[#868484] justify-start'}`}
                        // onClick={() => setPump1(!pump1)}
                    >
                        {/* {!pump1 && <NextImage src="/imgs/oil-valve-gray.png" alt="valve" width={50} height={50} className="absolute left-2" />} */}
                        {pump1 ? "ON" : "OFF"}
                        {/* {pump1 && <NextImage src="/imgs/oil-valve.png" alt="valve" width={50} height={50} className="absolute right-2" />} */}
                    </button>
                    <span className="mt-1 mb-2 text-2xl text-white">PUMP 1</span>
                </div>
                <div className="flex flex-col items-center">
                    <button
                        className={`relative flex px-40 py-2 transition-all duration-300 rounded-lg shadow-md 
                        ${pump2 ? 'bg-[#0ac507] hover:bg-[#45da42] text-2xl text-white justify-end' : 'bg-[#c5c5c5] hover:bg-gray-500 text-2xl text-[#868484] justify-start'}`}                        
                        onClick={() => setPump2(!pump2)}
                    >
                        {/* {!pump2 && <NextImage src="/imgs/oil-valve-gray.png" alt="valve" width={50} height={50} className="absolute left-2" />} */}
                        {pump2 ? "ON" : "OFF"}
                        {/* {pump2 && <NextImage src="/imgs/oil-valve.png" alt="valve" width={50} height={50} className="absolute right-2" />} */}
                    </button>
                    <span className="mt-1 text-2xl text-white">PUMP 2</span>
                </div>
            </div>
        </div>
    );
};

const WidgetConductivityVoltage = ({ data }: { data: TYPE_VOLTAGE[] }) => {
    return (
        <div className="flex flex-row p-4 border-2 border-gray-500 rounded-lg shadow-lg w-full">
            <div className="flex flex-col justify-between text-white w-full">
                <div className="flex items-end text-2xl text-[#ff2313] self-start" style={{ textShadow: "0px 0px 10px #ff2313" }}>
                    <NextImage src="/imgs/heartbeat_icon_red.png" alt="logo_vf" width={30} height={30} className="mr-2" />
                    CONDUCTIVITY & VOLTAGE
                </div>

                {/* Grid đảm bảo các cột thẳng hàng */}
                <div className="grid grid-cols-3 w-full items-center gap-4">
                    {/* Row 1 */}
                    <span className="text-1xl font-bold text-[#9da19c] text-left whitespace-nowrap">Bồn nước rửa 06:</span>
                    <span className="text-3xl font-bold text-[#e7eee6] text-center whitespace-nowrap ml-8">{data[0]?.conductivity_1?.toFixed(1)}</span>
                    <span className="text-1xl font-bold text-[#9da19c] text-center w-1/5 whitespace-nowrap ">(μS/cm)</span>

                    {/* Row 2 */}
                    <span className="text-1xl font-bold text-[#9da19c] text-left whitespace-nowrap">Bồn điện cực dương:</span>
                    <span className="text-3xl font-bold text-[#e7eee6] text-center whitespace-nowrap ml-8">{data[0]?.conductivity_2?.toFixed(1)}</span>
                    <span className="text-1xl font-bold text-[#9da19c] text-center w-1/5  whitespace-nowrap">(μS/cm)</span>

                    {/* Row 3 */}
                    <span className="text-1xl font-bold text-[#9da19c] text-left whitespace-nowrap">DC VOLTAGE:</span>
                    <span className="text-3xl font-bold text-[#e7eee6] text-center whitespace-nowrap ml-8">{data[0]?.voltage?.toFixed(1)}</span>
                    <span className="text-1xl font-bold text-[#9da19c] text-center w-1/5 whitespace-nowrap">(Voltage)</span>
                </div>
            </div>

            <div className="flex flex-col items-center bg-[#1a192e] pt-1 h-full w-2/5 ml-auto">
                <GaugeChartVoltage value={data[0]?.voltage ?? 0} min={0} max={500}  alarm_set={data[0].alarm ?? 0}/>
            </div>
        </div>
    );
};

const temperatureLabels = [
    "Bồn nước nóng",
    "Bồn tẩy dầu 01",
    "Bồn tẩy dầu 02",
    "Bồn gia nhiệt",
    "Bồn phủ phốt phát",
    "Lò sấy ED",
    "Bồn sơn ED"
];
const WidgetTemperature = ({ data }: { data: TYPE_TEMPER[] }) => {
    return (
        <div className="flex-1 p-1 border-2 border-gray-500 rounded-lg shadow-lg pr-1 overflow-y-auto h-full w-full" >
            <div className="flex items-end mb-1 mt-4 text-4xl text-[#ff2313] self-start" style={{ textShadow: "0px 0px 10px #ff2313" }}>
                <NextImage src="/imgs/red_temp-removebg-preview.png" alt="logo_vf" width={40} height={30} className="ml-2 mr-2" />
                TEMPERATURE
            </div>
            <div className="grid grid-cols-1 h-full p-4">
                {data.slice(0, 7).map((item, index) => {
                    const min = 0;
                    const max = 100;
                    const min_temp = item.temperature_min || 0;
                    const max_temp = item.temperature_max || 100;
                    const current = item.temperature || 0;

                    // Tính phần trăm vị trí của nhiệt độ hiện tại, min, max
                    const currentPercent = ((current - min) / (max - min)) * 100;
                    const minPercent = ((min_temp - min) / (max - min)) * 100;
                    const maxPercent = ((max_temp - min) / (max - min)) * 100;
                    const isWithinRange = current >= min_temp && current <= max_temp;
                    const trackColor = isWithinRange ? "bg-[#0ac507]" : "bg-[#ff2313]";
                    const sliderClass = isWithinRange ? "green-thumb" : "red-thumb";
                    const thumbOffset = 12.5; // Nửa độ rộng của thumb (25px / 2)
                    const thumbPosition = `calc(${currentPercent}% - ${thumbOffset}px)`;

                    return (
                        <div key={index} className="justify-between h-full">
                            <div className="flex items-center">
                                <span className={`w-1/3 font-bold`} style={{ color: isWithinRange ? "#0ac507" : "#ff2313" }}>
                                        {temperatureLabels[index]}
                                    </span>
                                <div className="relative w-full mr-4">
                                    {/* Thanh trượt */}
                                    <div className="relative w-full flex items-center">
                                        {/* Thanh màu của slide bar */}
                                        <div className="absolute w-full h-4 bg-gray-300 mr-1 rounded-lg">
                                            <div
                                                className={`absolute h-4 rounded-lg ${trackColor}`}
                                                style={{ width: `${currentPercent}%` }}
                                            ></div>
                                        </div>

                                        {/* Input range đặt trên thanh màu */}
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={current - 0.1}
                                            readOnly
                                            // className={'absolute w-full h-2 bg-transparent appearance-none custom-slider ${sliderClass}'}
                                            className={`absolute w-full h-2 bg-transparent rounded-lg appearance-none custom-slider ${sliderClass}`}
                                        />
                                         {/* Chấm trắng cho min_temp */}
                                        <div 
                                            className="absolute w-3 h-3 bg-white rounded-full "
                                            style={{ left: `calc(${minPercent}% - 6px)`, top: "-6px" }}
                                        ></div>

                                        {/* Chấm trắng cho max_temp */}
                                        <div 
                                            className="absolute w-3 h-3 bg-white rounded-full "
                                            style={{ left: `calc(${maxPercent}% - 12px)`, top: "-6px" }}
                                        ></div>
                                        </div>

                                    {/* Hiển thị giá trị `temperature` tại đúng vị trí */}
                                    <div 
                                        className="absolute text-white text-1x1 font-bold transform -translate-x-1/2 -translate-y-8"
                                        style={{ left: `${currentPercent}%` }}
                                    >
                                        {current.toFixed(1)}°C
                                    </div>
                                    {/* Hiển thị temperature_min bên dưới thanh trượt */}
                                    <div 
                                        className="absolute text-[#ff2313] text-1x1 font-bold transform -translate-x-1/2 translate-y-2"
                                        style={{ left: `${minPercent}%` }}
                                    >
                                        {min_temp.toFixed(1)}°C
                                    </div>
                                    {/* Hiển thị temperature_max bên dưới thanh trượt */}
                                    <div 
                                        className="absolute text-[#ff2313] text-1x1 font-bold transform -translate-x-1/2 translate-y-2"
                                        style={{ left: `${maxPercent}%` }}
                                    >
                                        {max_temp.toFixed(1)}°C
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                 .custom-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 25px;
                    height: 25px;
                    cursor: pointer;
                }

                .custom-slider::-moz-range-thumb {
                    width: 25px;
                    height: 25px;
                    cursor: pointer;
                }

                .green-thumb::-webkit-slider-thumb {
                    background: url('/imgs/icon_temper_green_fotor.png') no-repeat center;
                    background-size: cover;
                }

                .green-thumb::-moz-range-thumb {
                    background: url('/imgs/icon_temper_green_fotor.png') no-repeat center;
                    background-size: cover;
                }

                .red-thumb::-webkit-slider-thumb {
                    background: url('/imgs/icontemp_red_fotor.png') no-repeat center;
                    background-size: cover;
                }

                .red-thumb::-moz-range-thumb {
                    background: url('/imgs/icontemp_red_fotor.png') no-repeat center;
                    background-size: cover;
                }
            `}</style>
        </div>
    );
};

export default function Page() {
    const { width = 0, height = 0 } = useWindowSize();
    const [cpu_info, setCpuInfo] = useState<TYPE_CPU>({
        connection: true,
        ip: "127.0.0.1",
        port: 502,
        fps: 0,
    });

    const [list_pressure, setListPressure] = useState<TYPE_PRESSURE[]>(Array.from(Array(15).keys(), (value, key) => {
    // if (key < 1)
    //     return {
    //         id: -1,
    //     }
    return {
        id: key,
        // name: 'ÁP SUẤT',
        pressure: Math.random() * 3.5,
        max_pressure: Math.random()*1 + 1,
        min_pressure:Math.random()* 1,
        avg_pressure: 3,
        time_start: "00:00:00",
        time_delta: 1000,
    }
    }));

    const [list_pump, setListPump] = useState<TYPE_PUMP[]>(Array.from(Array(2).keys(), (value, key) => ({
        id: key + 1,
        name: `Pump ${key + 1}`,
        status: Math.random() > 0.5 ? "ON" : "OFF",
        last_changed: new Date().toISOString(),
    })));

    const [list_voltage, setListVoltage] = useState<TYPE_VOLTAGE[]>(Array.from(Array(1).keys(), (value, key) => ({
        id: key + 1,
        name: `Voltage ${key + 1}`,
        voltage: Math.random() * 500, // Giá trị điện áp ngẫu nhiên từ 0 - 10V
        // voltage: 480,
        conductivity_1: Math.random() * 500, // Độ dẫn điện 1 từ 0 - 500 μS/cm
        conductivity_2: Math.random() * 500, // Độ dẫn điện 2 từ 0 - 500 μS/cm
        alarm:400,
        time_start: new Date().toISOString(),
        time_delta: Math.floor(Math.random() * 1000), // Thời gian chạy ngẫu nhiên
        last_ts: Date.now(),
        last_dt: new Date().toISOString(),
    })));
    const [list_temperature, setListTemperature] = useState<TYPE_TEMPER[]>(Array.from(Array(7).keys(), (value, key) => ({
        id: key + 1,
        name: `Temperature ${key + 1}`,
        temperature: Math.random() *100,
        temperature_min: Math.random() * 20,
        temperature_max: Math.random() * 30 + 70,
        time_start: "00:00:00",
        time_delta: 1000,
    })));
    const [counter, setCounter] = useState(0);
    useEffect(() => {
    }, []);


    useInterval(() => {
        setCounter((p) => p + 1);
    }, 500);

    return (
        <div className="flex p-1 justify-end h-screen w-full">
            <div className="h-screen w-60% flex flex-col gap-2 p-1 mb-2">
                    <WidgetPump data={list_pump} />
                    <WidgetConductivityVoltage data={list_voltage} />
                    <WidgetTemperature data={list_temperature} />
            </div>
            <div className="h-screen w-140% p-1 flex mr-1 mb-2">
                    <WidgetPressure data={list_pressure} />
            </div>
        </div>
    );
}
