function f = a2n2a ()
    %data = csvread('rs_1.csv');
    data = csvread('lw_1.csv');
    probMatrix = a(data);
    b(data);
    calculated = probMatrix(end, :);
    semilogx(probMatrix(:,1), probMatrix(:,2),calculated(1,1), calculated(1,2), 'o');
    axis([1 inf 0 1]);
    title('Rejection Sampling P(r=T|s,w) on 100000 samples');
    xlabel('N Samples');
    ylabel('Probability');
    legend('P(r|s,w)','Upper Confidence bound','Lower Confidence bound',['Approx = ', num2str(calculated(1,2),5)]);
end

function f=a(data)
    sizeData = size(data);
    rained = 0;
    acceptedSample = 0;
    f = zeros(sizeData(1,1) - 1, 4);
    for i = 2:sizeData(1,1)
        if data(i) ~= -1
            if data(i) == 1
                rained = rained + 1;
            end
            acceptedSample = acceptedSample + 1;
        end
        e = sqrt((-log(0.05/2))/(2*acceptedSample));
        prob = rained/acceptedSample;
        f(i,:) = [i, prob, prob + e, prob - e];
    end
end

function f=b(data)
    sizeData = size(data);
    rained = 0;
    wr = 0;
    notRained = 0;
    wnr = 0;
    f = zeros(sizeData(1,1), 3);
    for i = 1:sizeData(1,1)
        if data(i, 1) == 1
            rained = rained + 1;
            wr = wr + data(i, 2);
        else
            notRained = notRained + 1;
            wnr = wnr + data(i, 2);
        end
        %e = sqrt((-log(0.05/2))/(2*acceptedSample));
        %prob = rained/acceptedSample;
        %f(i,:) = [i, prob, prob + e, prob - e];
    end
    rained
    wr/rained
    notRained
    wnr/notRained
end
