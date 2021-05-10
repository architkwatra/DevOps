top -bn1 | grep '%Cpu(s)' | awk -F',' '{printf $4}' | sed 's/^ *//g' | cut -d ' ' -f 1 >>cpu-green.txt
free -t | awk 'NR == 2 {printf("%.2f\n"), $3/$2*100}' >> mem-green.txt